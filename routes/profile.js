import express from 'express';
import User from '../models/User.js';

const profileRouter = express.Router();

// Get the profile of the currently logged-in user
profileRouter.get('/', async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: 'No userId provided' });
      }
      const user = await User.findById(userId).select('-password');
      // Rest of your code...
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Get the profile of a specific user by ID
profileRouter.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email -phone');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user profile
profileRouter.put('/:userId', async (req, res) => {
    try {
      const { userId } = req.params; // 从 URL 参数中获取 userId
      const { bio } = req.body; // 从请求体中获取 bio

      // 确保 userId 和 bio 都存在
      if (!userId || !bio) {
        return res.status(400).json({ message: 'UserId and bio are required' });
      }

      // 更新用户信息
      const updatedUser = await User.findByIdAndUpdate(userId, { bio }, { new: true }).select('-password');
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // 返回更新后的用户信息
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user' });
    }
});

export default profileRouter;
