const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { streamGrokResponse, buildMessages } = require('../ai/grok');
const { getUserMemory, updateUserMemory, extractMemoryFromConversation } = require('../memory/memoryManager');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// In-memory message store: userId -> messages[]
const messagesStore = new Map();
// In-memory sessions store: userId -> sessions[]
const sessionsStore = new Map();

// POST /api/chat/message  — streaming SSE response
router.post('/message', optionalAuth, async (req, res) => {
  const { message, sessionId, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const userId = req.user?.id || 'guest';
    let memory = '';

    if (req.user?.id) {
      const memoryData = await getUserMemory(userId);
      memory = memoryData?.memory_text || '';
    }

    const messages = buildMessages(history, message, memory);
    const currentSessionId = sessionId || uuidv4();

    // In-memory save
    if (!messagesStore.has(userId)) messagesStore.set(userId, []);
    messagesStore.get(userId).push({
      id: uuidv4(),
      session_id: currentSessionId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    });

    let fullResponse = '';

    streamGrokResponse(
      messages,
      (delta, accumulated) => {
        res.write(`data: ${JSON.stringify({ delta, accumulated, done: false })}\n\n`);
        fullResponse = accumulated;
      },
      async (complete) => {
        res.write(`data: ${JSON.stringify({ delta: '', accumulated: complete, done: true, sessionId: currentSessionId })}\n\n`);
        res.end();

        // In-memory save AI response
        messagesStore.get(userId).push({
          id: uuidv4(),
          session_id: currentSessionId,
          role: 'assistant',
          content: complete,
          created_at: new Date().toISOString(),
        });

        // Update memory
        if (req.user?.id) {
          const memoryContext = extractMemoryFromConversation(message, complete);
          if (memoryContext) {
            await updateUserMemory(userId, memoryContext);
          }
        }
      },
      (err) => {
        console.error('Grok stream error:', err.response?.data || err.message);
        res.write(`data: ${JSON.stringify({ error: 'AI response failed', done: true })}\n\n`);
        res.end();
      }
    );
  } catch (err) {
    console.error('Chat error:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'Something went wrong', done: true })}\n\n`);
    res.end();
  }
});

// GET /api/chat/sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const sessions = sessionsStore.get(userId) || [];
  res.json({ sessions });
});

// GET /api/chat/history/:sessionId
router.get('/history/:sessionId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const allMessages = messagesStore.get(userId) || [];
  const sessionMessages = allMessages.filter(m => m.session_id === req.params.sessionId);
  res.json({ messages: sessionMessages });
});

module.exports = router;
