/**
 * Puzzle Routes
 * API endpoints for chess puzzles
 */

import express from 'express';
import puzzleService from '../services/puzzleService.js';
import ratingService from '../services/ratingService.js';
import User from '../models/User.js';
import PuzzleHistory from '../models/PuzzleHistory.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

/**
 * GET /api/puzzles/daily
 * Get daily puzzle (no auth required)
 */
router.get('/daily', async (req, res) => {
  try {
    const puzzle = await puzzleService.getDailyPuzzle();
    res.json(puzzle);
  } catch (error) {
    console.error('Error fetching daily puzzle:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/puzzles/random
 * Get a random puzzle (no auth required)
 */
router.get('/random', async (req, res) => {
  try {
    const targetRating = parseInt(req.query.rating) || 1200;
    const puzzle = await puzzleService.getRandomPuzzle(targetRating);
    res.json(puzzle);
  } catch (error) {
    console.error('Error fetching random puzzle:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/puzzles/themes
 * Get available puzzle themes
 */
router.get('/themes', async (req, res) => {
  try {
    const themes = await puzzleService.getAvailableThemes();
    res.json({ themes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/puzzles/stats
 * Get puzzle database stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await puzzleService.getPuzzleStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/puzzles/next
 * Get next puzzle based on user's rating
 */
router.get('/next', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRating = user.ratings?.puzzle?.rating || 1200;
    const lastPuzzleId = req.query.lastPuzzleId || null;
    const puzzle = await puzzleService.getNextPuzzle(userRating, lastPuzzleId);
    
    res.json({
      ...puzzle,
      userRating
    });
  } catch (error) {
    console.error('Error fetching next puzzle:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/puzzles/:id
 * Get specific puzzle by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const puzzle = await puzzleService.getPuzzleById(req.params.id);
    res.json(puzzle);
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    res.status(404).json({ error: error.message });
  }
});

/**
 * POST /api/puzzles/:id/solve
 * Submit puzzle solution and update rating
 */
router.post('/:id/solve', authenticateToken, async (req, res) => {
  try {
    const { solved, timeSpent, puzzleRating, themes } = req.body;
    const puzzleId = req.params.id;
    const userId = req.user.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize ratings if not exists
    if (!user.ratings) {
      user.ratings = {
        puzzle: { rating: 1200, rd: 350, solved: 0, failed: 0, streak: 0, bestStreak: 0 },
        battle: { rating: 1200, rd: 350, games: 0, wins: 0, losses: 0, draws: 0 }
      };
    }
    if (!user.ratings.puzzle) {
      user.ratings.puzzle = { rating: 1200, rd: 350, solved: 0, failed: 0, streak: 0, bestStreak: 0 };
    }

    const currentRating = user.ratings.puzzle.rating || 1200;
    const currentRD = user.ratings.puzzle.rd || 350;

    // Calculate new rating
    const ratingResult = ratingService.calculatePuzzleRating(
      currentRating,
      currentRD,
      puzzleRating || 1200,
      solved
    );

    // Update user ratings
    user.ratings.puzzle.rating = ratingResult.newRating;
    user.ratings.puzzle.rd = ratingResult.newRD;
    user.ratings.puzzle.lastPlayed = new Date();

    if (solved) {
      user.ratings.puzzle.solved = (user.ratings.puzzle.solved || 0) + 1;
      user.ratings.puzzle.streak = (user.ratings.puzzle.streak || 0) + 1;
      if (user.ratings.puzzle.streak > (user.ratings.puzzle.bestStreak || 0)) {
        user.ratings.puzzle.bestStreak = user.ratings.puzzle.streak;
      }
    } else {
      user.ratings.puzzle.failed = (user.ratings.puzzle.failed || 0) + 1;
      user.ratings.puzzle.streak = 0;
    }

    await user.save();

    // Save puzzle history
    const history = new PuzzleHistory({
      userId,
      puzzleId,
      solved,
      timeSpent: timeSpent || 0,
      ratingBefore: currentRating,
      ratingAfter: ratingResult.newRating,
      ratingChange: ratingResult.ratingChange,
      puzzleRating: puzzleRating || 1200,
      themes: themes || []
    });
    await history.save();

    res.json({
      success: true,
      solved,
      ratingChange: ratingResult.ratingChange,
      newRating: ratingResult.newRating,
      streak: user.ratings.puzzle.streak,
      bestStreak: user.ratings.puzzle.bestStreak,
      totalSolved: user.ratings.puzzle.solved,
      tier: ratingService.getRatingTier(ratingResult.newRating)
    });
  } catch (error) {
    console.error('Error solving puzzle:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/puzzles/user/stats
 * Get user's puzzle statistics
 */
router.get('/user/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const puzzleStats = user.ratings?.puzzle || {
      rating: 1200,
      solved: 0,
      failed: 0,
      streak: 0,
      bestStreak: 0
    };

    // Get recent history
    const recentHistory = await PuzzleHistory.find({ userId: req.user.id })
      .sort({ solvedAt: -1 })
      .limit(20);

    // Calculate accuracy
    const total = puzzleStats.solved + puzzleStats.failed;
    const accuracy = total > 0 ? Math.round((puzzleStats.solved / total) * 100) : 0;

    res.json({
      rating: puzzleStats.rating,
      rd: puzzleStats.rd,
      solved: puzzleStats.solved,
      failed: puzzleStats.failed,
      total,
      accuracy,
      streak: puzzleStats.streak,
      bestStreak: puzzleStats.bestStreak,
      tier: ratingService.getRatingTier(puzzleStats.rating),
      recentHistory: recentHistory.map(h => ({
        puzzleId: h.puzzleId,
        solved: h.solved,
        ratingChange: h.ratingChange,
        puzzleRating: h.puzzleRating,
        date: h.solvedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching puzzle stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/puzzles/user/history
 * Get user's puzzle history
 */
router.get('/user/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const history = await PuzzleHistory.find({ userId: req.user.id })
      .sort({ solvedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PuzzleHistory.countDocuments({ userId: req.user.id });

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching puzzle history:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
