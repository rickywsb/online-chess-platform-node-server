import express from 'express';
import Comment from '../models/Comment.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

// 路由来添加评论
router.post('/comment-player', authenticateToken, async (req, res) => {
  const { chessPlayerUsername, comment } = req.body;
  const userId = req.user._id;

  try {
    const newComment = new Comment({
      chessPlayerUsername,
      comment,
      user: userId
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// 路由来获取特定棋手的所有评论
router.get('/comments/:chessPlayerUsername', async (req, res) => {
  const { chessPlayerUsername } = req.params;

  try {
    const comments = await Comment.find({ chessPlayerUsername }).populate('user', 'username');
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

export default router;
