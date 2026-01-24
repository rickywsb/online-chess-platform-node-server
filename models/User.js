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
  phoneNumber: { type: String },
  purchasedCourses: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Course'
  }],
  teachingCourses: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Course'
  }],
  registrationDate: { type: Date, default: Date.now },
  chessModel: { type: String },
  gameHistory: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Game'
  }],
  
  // Chess Rating System
  ratings: {
    puzzle: {
      rating: { type: Number, default: 1200 },
      rd: { type: Number, default: 350 },  // Rating Deviation (Glicko-2)
      solved: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
      lastPlayed: { type: Date }
    },
    battle: {
      rating: { type: Number, default: 1200 },
      rd: { type: Number, default: 350 },
      games: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      lastPlayed: { type: Date }
    }
  }
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

