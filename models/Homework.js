import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  dueDate: { type: Date, required: true },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissionFile: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number },
    feedback: { type: String }
  }],
  // You can add more homework-specific fields here
});

const Homework = mongoose.model('Homework', homeworkSchema);

export default Homework;