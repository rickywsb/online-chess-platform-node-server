import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: false, // 如果您打算使用视频 ID，这个字段可以是非必需的
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  videoId: { // 添加视频 ID 引用
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video', // 引用 'Video' 模型
    required: false, // 这个字段可以是非必需的，取决于您的业务逻辑
  },
});

export default mongoose.model('Module', moduleSchema);
