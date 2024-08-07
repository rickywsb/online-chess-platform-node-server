import express from 'express';
import User from '../models/User.js';
import isAdminMiddleware from '../middlewares/isAdminMiddleware.js';
import isStudentMiddleware from '../middlewares/isStudentMiddleware.js';


const router = express.Router();
// 更改用户角色的路由
router.patch('/user/:userId/role', isAdminMiddleware, async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // 检查 newRole 是否有效
      if (!['student', 'instructor', 'admin'].includes(newRole)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
  
      user.role = newRole;
      await user.save();
  
      res.status(200).json({ message: 'User role updated successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
  });

  // 获取所有用户的路由
router.get('/users', isAdminMiddleware, async (req, res) => {
  try {
      const users = await User.find({}).select('-password'); // 获取所有用户，但不包括密码字段
      res.json(users);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Endpoint to get user rank
router.get('/rank/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const rank = await User.countDocuments({ registrationDate: { $lte: user.registrationDate } });
    res.json({ rank });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//   // 示例：只有学生可以访问的路由
// router.get('/some-student-specific-route', isStudentMiddleware, (req, res) => {
//     // 处理学生的请求
//     // ...
//   });


//   // 示例：只有教师可以访问的路由
// router.post('/create-course', isInstructorMiddleware, (req, res) => {
//     // 处理课程创建的逻辑
//     // ...
//   });
  
//   router.put('/update-course/:courseId', isInstructorMiddleware, (req, res) => {
//     // 处理课程更新的逻辑
//     // ...
//   });
  
//   router.delete('/delete-course/:courseId', isInstructorMiddleware, (req, res) => {
//     // 处理课程删除的逻辑
//     // ...
//   });

  export default router;