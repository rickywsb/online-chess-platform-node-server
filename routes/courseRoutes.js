import express from 'express';
import Course from '../models/Course.js';

const router = express.Router();

// 获取所有课程
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新课程
router.post('/', async (req, res) => {
  const course = new Course({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    instructor: req.body.instructor,
    // enrolledStudents: req.body.enrolledStudents, // Optionally add this if you're enrolling students upon creation
  });

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取单个课程
router.get('/:id', getCourse, (req, res) => {
  res.json(res.course);
});

// 更新课程
router.patch('/:id', getCourse, async (req, res) => {
  if (req.body.title != null) {
    res.course.title = req.body.title;
  }
  if (req.body.description != null) {
    res.course.description = req.body.description;
  }
  if (req.body.price != null) {
    res.course.price = req.body.price;
  }
  // Add other fields you want to be updatable

  try {
    const updatedCourse = await res.course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除课程
router.delete('/:id', getCourse, async (req, res) => {
    try {
      await res.course.deleteOne(); // Use deleteOne if res.course is a Mongoose document
      res.json({ message: 'Deleted Course' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Middleware to get course by ID
async function getCourse(req, res, next) {
  let course;
  try {
    course = await Course.findById(req.params.id);
    if (course == null) {
      return res.status(404).json({ message: 'Cannot find course' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.course = course;
  next();
}

export default router;
