import express from 'express';
import broadcastService from '../services/broadcastService.js';

const router = express.Router();

/**
 * GET /api/broadcasts
 * Get list of broadcasts
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const broadcasts = await broadcastService.getBroadcasts(page);
    res.json(broadcasts);
  } catch (error) {
    console.error('Error in GET /broadcasts:', error.message);
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

/**
 * GET /api/broadcasts/top
 * Get featured/top broadcasts
 */
router.get('/top', async (req, res) => {
  try {
    const broadcasts = await broadcastService.getTopBroadcasts();
    res.json(broadcasts);
  } catch (error) {
    console.error('Error in GET /broadcasts/top:', error.message);
    res.status(500).json({ error: 'Failed to fetch top broadcasts' });
  }
});

/**
 * GET /api/broadcasts/:tournamentId
 * Get a specific broadcast tournament
 */
router.get('/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const broadcast = await broadcastService.getBroadcastTournament(tournamentId);
    res.json(broadcast);
  } catch (error) {
    console.error('Error in GET /broadcasts/:tournamentId:', error.message);
    res.status(500).json({ error: 'Failed to fetch broadcast' });
  }
});

/**
 * GET /api/broadcasts/:tournamentId/:roundId
 * Get a specific broadcast round
 */
router.get('/:tournamentId/:roundId', async (req, res) => {
  try {
    const { tournamentId, roundId } = req.params;
    const round = await broadcastService.getBroadcastRound(tournamentId, roundId);
    res.json(round);
  } catch (error) {
    console.error('Error in GET /broadcasts/:tournamentId/:roundId:', error.message);
    res.status(500).json({ error: 'Failed to fetch broadcast round' });
  }
});

/**
 * GET /api/broadcasts/:tournamentId/:roundId/pgn
 * Get PGN of a broadcast round
 */
router.get('/:tournamentId/:roundId/pgn', async (req, res) => {
  try {
    const { tournamentId, roundId } = req.params;
    const pgn = await broadcastService.getBroadcastPgn(tournamentId, roundId);
    res.type('text/plain').send(pgn);
  } catch (error) {
    console.error('Error in GET /broadcasts/:tournamentId/:roundId/pgn:', error.message);
    res.status(500).json({ error: 'Failed to fetch PGN' });
  }
});

/**
 * GET /api/broadcasts/:tournamentId/:roundId/games
 * Get parsed games of a broadcast round
 */
router.get('/:tournamentId/:roundId/games', async (req, res) => {
  try {
    const { tournamentId, roundId } = req.params;
    const pgn = await broadcastService.getBroadcastPgn(tournamentId, roundId);
    const games = broadcastService.parsePgn(pgn);
    res.json(games);
  } catch (error) {
    console.error('Error in GET /broadcasts/:tournamentId/:roundId/games:', error.message);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

export default router;
