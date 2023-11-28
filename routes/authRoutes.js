import express from 'express';
import jwt from 'jsonwebtoken';
import logger from '../logger.js'; // 引入你的 Winston logger 实例
import authMiddleware from '../authMiddleware.js';

import User from '../models/User.js'; // Make sure User.js is also using ES module syntax

const router = express.Router();
// 受保护的路由
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'You have access to the protected route!' });
});

router.post('/register', async (req, res) => {
  logger.info('Register endpoint hit', req.body); // 这应该在请求到达时打印

  try {
    // 获取用户输入
    const { username, email, password, phoneNumber } = req.body;

    // 确保用户不存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 创建新用户（不哈希密码）
    const newUser = new User({
      username,
      email,
      password, 
      phoneNumber,
    });

    // 保存用户
    await newUser.save();

    // 返回成功响应
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    logger.error('Error registering new user', { error: error.message });
    res.status(500).json({ message: 'Error registering new user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
 
  logger.info('Login endpoint hit', { email: req.body.email }); // 记录请求到达

  try {
    // 获取用户输入
    const { email, password } = req.body;

    // 确认用户存在
    const user = await User.findOne({ email });
    if (!user) {
      logger.error('User not found', { email }); // 记录用户未找到的错误
      return res.status(404).json({ message: 'User not found' });
    }

    // 直接比较明文密码
    const isPasswordCorrect = (password === user.password);
    if (!isPasswordCorrect) {
      logger.error('Invalid credentials', { email }); // 记录无效凭证的错误
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    logger.info('Password matches', { email });

    // 生成JWT令牌
    const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, 'yourSecretKey', { expiresIn: '1h' });

    logger.info('JWT token generated', { token ,email }); // 记录令牌生成


    // 返回令牌和用户信息
    res.status(200).json({ result: user, token });
    console.log(user); // 添加这行来检查 user 对象

  } catch (error) {
    logger.error('Login error', { error: error.message, email: req.body.email }); // 记录登录过程中的任何其他错误
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

export default router;
