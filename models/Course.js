import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Course cover image URL
  coverImage: { type: String, default: '' },
  // Course category
  category: { 
    type: String, 
    enum: ['popular', 'openings', 'endgame', 'strategy', 'tactics', 'beginners'],
    default: 'popular'
  },
  // Author/Instructor name for display
  authorName: { type: String, default: '' },
  // Course level
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

export default Course;