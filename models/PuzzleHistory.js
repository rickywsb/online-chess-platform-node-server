import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const puzzleHistorySchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  puzzleId: { 
    type: String, 
    required: true  // Lichess puzzle ID
  },
  solved: { 
    type: Boolean, 
    required: true 
  },
  attempts: { 
    type: Number, 
    default: 1 
  },
  timeSpent: { 
    type: Number,  // seconds
    default: 0
  },
  ratingBefore: { 
    type: Number 
  },
  ratingAfter: { 
    type: Number 
  },
  ratingChange: { 
    type: Number 
  },
  puzzleRating: { 
    type: Number  // Difficulty of the puzzle
  },
  themes: [{ 
    type: String  // e.g., "fork", "pin", "mate"
  }],
  solvedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for efficient queries
puzzleHistorySchema.index({ userId: 1, solvedAt: -1 });
puzzleHistorySchema.index({ userId: 1, puzzleId: 1 }, { unique: true });

const PuzzleHistory = mongoose.model('PuzzleHistory', puzzleHistorySchema);

export default PuzzleHistory;
