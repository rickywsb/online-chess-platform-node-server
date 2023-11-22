import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true }, // 添加模块引用
  filePath: { type: String, required: true },
  duration: { type: Number, required: true },
  thumbnailPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // You can add more video-specific fields here
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
