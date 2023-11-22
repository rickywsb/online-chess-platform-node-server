// routes/modules.js
import express from 'express';
import Module from '../models/Module.js';

const Modulerouter = express.Router();

// 添加模块到课程
Modulerouter.post('/', async (req, res) => {
  const module = new Module({
    title: req.body.title,
    description: req.body.description,
    videoUrl: req.body.videoUrl,
    courseId: req.body.courseId,
  });

  try {
    const newModule = await module.save();
    res.status(201).json(newModule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取特定课程的所有模块
Modulerouter.get('/course/:courseId', async (req, res) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 其他CRUD操作...
// Update a module
Modulerouter.patch('/:moduleId', async (req, res) => {
    try {
      const updatedModule = await Module.findByIdAndUpdate(
        req.params.moduleId,
        req.body,
        { new: true } // Return the updated document
      );
      if (!updatedModule) {
        return res.status(404).json({ message: 'Module not found' });
      }
      res.json(updatedModule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  
  // Delete a module
Modulerouter.delete('/:moduleId', async (req, res) => {
    try {
      const module = await Module.findByIdAndDelete(req.params.moduleId);
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }
      res.json({ message: 'Module deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
export default Modulerouter;
