import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const isAdminMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }
    const token = req.headers.authorization.split(" ")[1];
    console.log('Extracted Token:', token); // 打印提取的令牌

    const decodedData = jwt.verify(token, 'yourSecretKey');
    console.log('Decoded Data:', decodedData); // 打印解码后的数据


    const user = await User.findById(decodedData.id);
    console.log('User Found:', user); // 打印找到的用户

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.userId = decodedData.id;
    next();
  } catch (error) {
    console.log('Error in isAdminMiddleware:', error); // 打印错误信息

    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default isAdminMiddleware;
