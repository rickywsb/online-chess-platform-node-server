import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  bio: { type: String },
  profilePicture: { type: String },
  dateOfBirth: { type: Date },
  phoneNumber: { type: String }, // 敏感信息，应当适当保护
  purchasedCourses: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Course' // 学生购买的课程
  }],
  teachingCourses: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Course' // 教师教授的课程
  }],
  registrationDate: { type: Date, default: Date.now } // Add this field

});

const User = mongoose.model('User', userSchema);

export default User;

// // Pre-save hook to hash password before saving
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 8);
//   next();
// });

// // Method to check the entered password against the hashed password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

