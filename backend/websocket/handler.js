const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { streamGrokResponse, buildMessages } = require('../ai/grok');
const { getUserMemory, updateUserMemory, extractMemoryFromConversation } = require('../memory/memoryManager');

const JWT_SECRET = process.env.JWT_SECRET || 'aria-super-secret-key-2026-change-me';

const activeSessions = new Map();

function setupWebSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket connected: ${socket.id}`);

    socket.on('authenticate', async (data) => {
      try {
        const { token } = data;
        let userId = null;

        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;
          } catch (e) {
            console.log('WS: invalid token, guest mode');
          }
        }

        const sessionId = uuidv4();
        activeSessions.set(socket.id, {
          userId: userId || 'guest',
          sessionId,
          history: [],
        });

        socket.emit('authenticated', { sessionId, userId });
      } catch (err) {
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    socket.on('send_message', async (data) => {
      const session = activeSessions.get(socket.id);
      if (!session) return;

      const { message, isVoice = false } = data;
      if (!message || !message.trim()) return;

      try {
        const { userId, history } = session;

        let memory = '';
        if (userId !== 'guest') {
          const memoryData = await getUserMemory(userId);
          memory = memoryData?.memory_text || '';
        }

        const messages = buildMessages(history, message, memory);
        socket.emit('typing_start', { isVoice });

        history.push({ role: 'user', content: message });

        let fullResponse = '';
        streamGrokResponse(
          messages,
          (delta, accumulated) => {
            socket.emit('message_chunk', { delta, accumulated, done: false });
            fullResponse = accumulated;
          },
          async (complete) => {
            socket.emit('message_chunk', { delta: '', accumulated: complete, done: true, isVoice });
            socket.emit('typing_end', {});

            history.push({ role: 'assistant', content: complete });
            if (history.length > 20) history.shift();

            if (userId !== 'guest') {
              const memCtx = extractMemoryFromConversation(message, complete);
              if (memCtx) await updateUserMemory(userId, memCtx);
            }
          },
          (err) => {
            socket.emit('message_error', { error: 'AI failed' });
            socket.emit('typing_end', {});
          }
        );
      } catch (err) {
        socket.emit('typing_end', {});
      }
    });

    socket.on('disconnect', () => {
      activeSessions.delete(socket.id);
    });
  });
}

module.exports = { setupWebSocket };
