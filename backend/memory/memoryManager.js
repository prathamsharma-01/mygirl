// In-memory storage for non-database version
const memoryStore = new Map();
const userPrefsStore = new Map();

/**
 * Get or create user memory for AI context
 */
async function getUserMemory(userId) {
  return { memory_text: memoryStore.get(userId) || '' };
}

/**
 * Update user memory with new context
 */
async function updateUserMemory(userId, newContext) {
  const existing = memoryStore.get(userId) || '';
  const updatedMemory = mergeMemory(existing, newContext);
  memoryStore.set(userId, updatedMemory);
  return updatedMemory;
}

/**
 * Extract key information from conversation to store as memory
 */
function extractMemoryFromConversation(userMessage, aiResponse) {
  const keywords = {
    name: /my name is (\w+)/i,
    job: /i (work as|am a|am an) ([^.!?]+)/i,
    location: /i (live in|am from|am in) ([^.!?]+)/i,
    hobby: /i (love|like|enjoy) ([^.!?]+)/i,
    age: /i(?:'m| am) (\d+) years? old/i,
  };

  const extracted = [];

  const nameMatch = userMessage.match(keywords.name);
  if (nameMatch) extracted.push(`Name: ${nameMatch[1]}`);

  const jobMatch = userMessage.match(keywords.job);
  if (jobMatch) extracted.push(`Job: ${jobMatch[2].trim()}`);

  const locationMatch = userMessage.match(keywords.location);
  if (locationMatch) extracted.push(`Location: ${locationMatch[2].trim()}`);

  const hobbyMatch = userMessage.match(keywords.hobby);
  if (hobbyMatch) extracted.push(`Likes: ${hobbyMatch[2].trim()}`);

  const ageMatch = userMessage.match(keywords.age);
  if (ageMatch) extracted.push(`Age: ${ageMatch[1]}`);

  return extracted.join(', ');
}

/**
 * Simple memory merge — keeps last 800 chars for more context
 */
function mergeMemory(existing, newContext) {
  if (!newContext) return existing;
  const parts = [existing, newContext].filter(Boolean);
  const combined = parts.join('. ');
  return combined.length > 800 ? combined.slice(-800) : combined;
}

/**
 * Get user preferences
 */
async function getUserPreferences(userId) {
  return userPrefsStore.get(userId) || {
    voice: 'female',
    voiceRate: 0.9,
    voicePitch: 1.1,
    theme: 'dark',
    notificationsEnabled: true,
  };
}

/**
 * Save user preferences
 */
async function saveUserPreferences(userId, preferences) {
  const existing = await getUserPreferences(userId);
  const merged = { ...existing, ...preferences };
  userPrefsStore.set(userId, merged);
  return merged;
}

module.exports = { 
  getUserMemory, 
  updateUserMemory, 
  extractMemoryFromConversation,
  getUserPreferences,
  saveUserPreferences
};
