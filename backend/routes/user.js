const express = require('express');
const { getUserPreferences, saveUserPreferences, getUserMemory, updateUserMemory } = require('../memory/memoryManager');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [prefs, memory] = await Promise.all([
      getUserPreferences(userId),
      getUserMemory(userId),
    ]);

    res.json({
      user: { id: userId, email: req.user.email, name: req.user.name },
      preferences: prefs,
      memory: memory?.memory_text || '',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PATCH /api/user/preferences
router.patch('/preferences', authenticateToken, async (req, res) => {
  try {
    const updated = await saveUserPreferences(req.user.id, req.body);
    res.json({ preferences: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// PATCH /api/user/memory
router.patch('/memory', authenticateToken, async (req, res) => {
  try {
    const { memory } = req.body;
    await updateUserMemory(req.user.id, memory);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

module.exports = router;
