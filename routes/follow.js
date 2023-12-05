import express from 'express';
import FollowedPlayer from '../models/FollowedPlayer.js'; // Import the FollowedPlayer model
import User from '../models/User.js';
import authenticateToken from '../middlewares/authenticateToken.js'; // Import the authentication middleware

const router = express.Router();

// Route to follow a chess player
router.post('/follow-player', authenticateToken, async (req, res) => {
    const { chessPlayerUsername } = req.body; // Correctly extract chessPlayerUsername from the request body
    const userId = req.user._id;

    try {
        // Check if the player is already followed by the user
        const existingFollow = await FollowedPlayer.findOne({ chessPlayerUsername, user: userId });
        if (existingFollow) {
            return res.status(400).json({ message: 'Player already followed' });
        }

        // Create a new FollowedPlayer document
        const followedPlayer = new FollowedPlayer({
            chessPlayerUsername,
            user: userId
        });

        await followedPlayer.save();
        res.status(201).json(followedPlayer);
    } catch (error) {
        console.error('Follow player error:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Route to unfollow a chess player
router.delete('/unfollow-player/:chessPlayerUsername', authenticateToken, async (req, res) => {
    const { chessPlayerUsername } = req.params;
    const userId = req.user._id;

    try {
        const result = await FollowedPlayer.findOneAndDelete({ chessPlayerUsername, user: userId });
        if (!result) {
            return res.status(404).json({ message: 'Player not followed' });
        }

        res.json({ message: 'Player unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Route to get the list of players followed by a user
router.get('/user/:userId/followed-players', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const followedPlayers = await FollowedPlayer.find({ user: userId }).populate('username');
        res.json(followedPlayers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Optional: Route to get the list of followers for a specific chess player
router.get('/player/:chessPlayerUsername/followers', async (req, res) => {
    const { chessPlayerUsername } = req.params;

    try {
        const followers = await FollowedPlayer.find({ chessPlayerUsername }).populate('user');
        res.json(followers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
