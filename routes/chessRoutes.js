// routes/chessRoutes.js
import express from 'express';
import chessServer from '../stockfish/chessServer.js';

const router = express.Router();

router.post('/move', async (req, res) => {
    const { fen } = req.body;
    if (!fen) {
        return res.status(400).send('FEN string is required');
    }

    try {
        const bestMove = await chessServer.getBestMove(fen);
        if (bestMove) {
            res.json({ bestMove });
        } else {
            res.status(500).send('Error calculating best move');
        }
    } catch (error) {
        console.error('Error in /move route:', error);
        res.status(500).send('Internal server error');
    }
});

export default router;
