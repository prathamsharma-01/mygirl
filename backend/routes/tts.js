const express = require('express');
const axios = require('axios');
const router = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'dVTC43Yewy5fAIcmsISI'; // User's chosen voice

// GET /api/tts/speak?text=hello
// Uses ElevenLabs TTS — free tier: 10,000 chars/month
// POST /api/tts/speak
// Uses ElevenLabs TTS with a fallback to Google Translate TTS
router.post('/speak', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  // Helper to fetch Google Translate TTS as a fallback
  const fallbackGoogleTTS = async (text, res) => {
    try {
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
      const response = await axios.get(googleUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-cache');
      return res.send(response.data);
    } catch (err) {
      console.error('Google TTS Fallback error:', err.message);
      return res.status(500).json({ error: 'All TTS services failed' });
    }
  };

  // Try ElevenLabs first if key is present
  if (ELEVENLABS_API_KEY) {
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
        {
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.85,
            style: 0.35,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          responseType: 'arraybuffer',
          timeout: 8000, // Shorter timeout for faster fallback
        }
      );

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-cache');
      return res.send(response.data);
    } catch (err) {
      const errorMsg = err.response?.data ? Buffer.from(err.response.data).toString() : err.message;
      console.error('ElevenLabs TTS error, falling back to Google:', errorMsg);
      // If ElevenLabs fails (quota, block, etc.), fall back to Google Translate
      return fallbackGoogleTTS(text, res);
    }
  } else {
    // No ElevenLabs key, use Google Translate directly
    return fallbackGoogleTTS(text, res);
  }
});

module.exports = router;
