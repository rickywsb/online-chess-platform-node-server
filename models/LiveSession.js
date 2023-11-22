import mongoose from 'mongoose';

const liveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  liveUrl: { type: String, required: true },
  // You can add more live session-specific fields here
});

const LiveSession = mongoose.model('LiveSession', liveSessionSchema);

export default LiveSession;