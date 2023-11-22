// routes/videos.js
import express from 'express';
import multer from 'multer';
import Video from '../models/Video';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', upload.single('videoFile'), async (req, res) => {
  const { title, description, courseId } = req.body;
  const videoFile = req.file;

  const video = new Video({
    title,
    description,
    course: courseId,
    filePath: videoFile.path,
    // 其他字段...
  });

  try {
    const savedVideo = await video.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
