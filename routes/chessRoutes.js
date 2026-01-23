import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();

// AI service health check
router.get('/ai/health', async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze chess position
router.post('/ai/analyze', async (req, res) => {
  try {
    const { fen } = req.body;
    if (!fen) {
      return res.status(400).json({ error: 'Missing FEN parameter' });
    }
    const analysis = await aiService.analyzePosition(fen);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get best move
router.post('/ai/best-move', async (req, res) => {
  try {
    const { fen } = req.body;
    if (!fen) {
      return res.status(400).json({ error: 'Missing FEN parameter' });
    }
    const result = await aiService.getBestMove(fen);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
