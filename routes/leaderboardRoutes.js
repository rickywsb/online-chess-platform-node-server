/**
 * Leaderboard Routes
 * API endpoints for rating leaderboards
 */

import express from 'express';
import User from '../models/User.js';
import ratingService from '../services/ratingService.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

/**
 * GET /api/leaderboard/puzzle
 * Get puzzle rating leaderboard
 */
router.get('/puzzle', async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({
      'ratings.puzzle.solved': { $gt: 0 }
    })
      .select('username ratings.puzzle profilePicture')
      .sort({ 'ratings.puzzle.rating': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      'ratings.puzzle.solved': { $gt: 0 }
    });

    const leaderboard = users.map((user, index) => {
      const puzzle = user.ratings?.puzzle || {};
      const totalGames = (puzzle.solved || 0) + (puzzle.failed || 0);
      const accuracy = totalGames > 0 ? Math.round((puzzle.solved / totalGames) * 100) : 0;

      return {
        rank: skip + index + 1,
        oderId: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        rating: puzzle.rating || 1200,
        solved: puzzle.solved || 0,
        accuracy,
        streak: puzzle.bestStreak || 0,
        tier: ratingService.getRatingTier(puzzle.rating || 1200)
      };
    });

    res.json({
      leaderboard,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching puzzle leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/leaderboard/battle
 * Get battle rating leaderboard
 */
router.get('/battle', async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({
      'ratings.battle.games': { $gt: 0 }
    })
      .select('username ratings.battle profilePicture')
      .sort({ 'ratings.battle.rating': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      'ratings.battle.games': { $gt: 0 }
    });

    const leaderboard = users.map((user, index) => {
      const battle = user.ratings?.battle || {};
      const games = battle.games || 0;
      const winRate = games > 0 ? Math.round((battle.wins / games) * 100) : 0;

      return {
        rank: skip + index + 1,
        oderId: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        rating: battle.rating || 1200,
        games,
        wins: battle.wins || 0,
        losses: battle.losses || 0,
        draws: battle.draws || 0,
        winRate,
        tier: ratingService.getRatingTier(battle.rating || 1200)
      };
    });

    res.json({
      leaderboard,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching battle leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/leaderboard/user/rank
 * Get current user's rank (requires auth)
 */
router.get('/user/rank', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate puzzle rank
    const puzzleRating = user.ratings?.puzzle?.rating || 1200;
    const puzzleRank = await User.countDocuments({
      'ratings.puzzle.rating': { $gt: puzzleRating },
      'ratings.puzzle.solved': { $gt: 0 }
    }) + 1;

    // Calculate battle rank
    const battleRating = user.ratings?.battle?.rating || 1200;
    const battleRank = await User.countDocuments({
      'ratings.battle.rating': { $gt: battleRating },
      'ratings.battle.games': { $gt: 0 }
    }) + 1;

    // Total players
    const totalPuzzlePlayers = await User.countDocuments({
      'ratings.puzzle.solved': { $gt: 0 }
    });
    const totalBattlePlayers = await User.countDocuments({
      'ratings.battle.games': { $gt: 0 }
    });

    res.json({
      puzzle: {
        rank: user.ratings?.puzzle?.solved > 0 ? puzzleRank : null,
        rating: puzzleRating,
        total: totalPuzzlePlayers,
        percentile: totalPuzzlePlayers > 0 ? 
          Math.round((1 - puzzleRank / totalPuzzlePlayers) * 100) : null,
        tier: ratingService.getRatingTier(puzzleRating)
      },
      battle: {
        rank: user.ratings?.battle?.games > 0 ? battleRank : null,
        rating: battleRating,
        total: totalBattlePlayers,
        percentile: totalBattlePlayers > 0 ? 
          Math.round((1 - battleRank / totalBattlePlayers) * 100) : null,
        tier: ratingService.getRatingTier(battleRating)
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/leaderboard/top
 * Get top players for homepage display
 */
router.get('/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Top puzzle players
    const topPuzzle = await User.find({
      'ratings.puzzle.solved': { $gt: 0 }
    })
      .select('username ratings.puzzle profilePicture')
      .sort({ 'ratings.puzzle.rating': -1 })
      .limit(parseInt(limit));

    // Top battle players
    const topBattle = await User.find({
      'ratings.battle.games': { $gt: 0 }
    })
      .select('username ratings.battle profilePicture')
      .sort({ 'ratings.battle.rating': -1 })
      .limit(parseInt(limit));

    res.json({
      puzzle: topPuzzle.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        rating: user.ratings?.puzzle?.rating || 1200,
        solved: user.ratings?.puzzle?.solved || 0,
        tier: ratingService.getRatingTier(user.ratings?.puzzle?.rating || 1200)
      })),
      battle: topBattle.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        rating: user.ratings?.battle?.rating || 1200,
        games: user.ratings?.battle?.games || 0,
        tier: ratingService.getRatingTier(user.ratings?.battle?.rating || 1200)
      }))
    });
  } catch (error) {
    console.error('Error fetching top players:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
