import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../authMiddleware.js';

const profileRouter = express.Router();

// 应用 authMiddleware 到所有路由，确保只有登录用户才能访问
profileRouter.use(authMiddleware);

// 获取当前登录用户的个人资料
profileRouter.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('purchasedCourses') // 填充 purchasedCourses 字段
      .populate('teachingCourses'); // 填充 teachingCourses 字段
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取特定用户的个人资料
profileRouter.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('purchasedCourses') // 填充 purchasedCourses 字段
      .populate('teachingCourses'); // 填充 teachingCourses 字段
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 检查请求者是否是用户本人或管理员
    const isSelf = req.user.id === req.params.id || req.user.role === 'admin';
    
    // 根据角色和请求者身份选择性地返回数据
    const responseData = {
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture,
      role: user.role,
      courses: user.role === 'instructor' ? user.teachingCourses : user.purchasedCourses,
      email: isSelf ? user.email : undefined,
      phoneNumber: isSelf ? user.phoneNumber : undefined,
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// 更新用户个人资料
profileRouter.put('/me', async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, phoneNumber } = req.body;

    // 只更新允许的字段
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password')
      .populate('purchasedCourses') // 填充 purchasedCourses 字段
      .populate('teachingCourses'); // 填充 teachingCourses 字段
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

export default profileRouter;
