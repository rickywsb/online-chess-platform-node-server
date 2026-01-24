/**
 * Puzzle Model
 * Store chess puzzles locally for fast access
 */

import mongoose from 'mongoose';

const puzzleSchema = new mongoose.Schema({
  // Lichess puzzle ID
  puzzleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // FEN position where puzzle starts
  fen: {
    type: String,
    required: true
  },
  
  // Solution moves in UCI format
  moves: [{
    type: String
  }],
  
  // Puzzle rating (difficulty)
  rating: {
    type: Number,
    required: true,
    index: true
  },
  
  // Rating deviation
  ratingDeviation: {
    type: Number,
    default: 75
  },
  
  // Number of plays
  popularity: {
    type: Number,
    default: 0
  },
  
  // Number of times played on our platform
  plays: {
    type: Number,
    default: 0
  },
  
  // Puzzle themes/tags
  themes: [{
    type: String,
    index: true
  }],
  
  // Game URL (optional)
  gameUrl: {
    type: String
  },
  
  // Opening tags
  openingTags: [{
    type: String
  }],
  
  // Who moves first (white/black)
  toMove: {
    type: String,
    enum: ['white', 'black'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index for rating-based queries
puzzleSchema.index({ rating: 1, plays: 1 });
puzzleSchema.index({ themes: 1, rating: 1 });

// Static method to get random puzzle by rating range
puzzleSchema.statics.getRandomByRating = async function(targetRating, range = 200) {
  const minRating = targetRating - range;
  const maxRating = targetRating + range;
  
  const count = await this.countDocuments({
    rating: { $gte: minRating, $lte: maxRating }
  });
  
  if (count === 0) {
    // Fallback: get any puzzle
    const anyCount = await this.countDocuments();
    const randomIndex = Math.floor(Math.random() * anyCount);
    return this.findOne().skip(randomIndex);
  }
  
  const randomIndex = Math.floor(Math.random() * count);
  return this.findOne({
    rating: { $gte: minRating, $lte: maxRating }
  }).skip(randomIndex);
};

// Static method to get random puzzle by theme
puzzleSchema.statics.getRandomByTheme = async function(theme, targetRating = null) {
  const query = { themes: theme };
  if (targetRating) {
    query.rating = { $gte: targetRating - 200, $lte: targetRating + 200 };
  }
  
  const count = await this.countDocuments(query);
  if (count === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * count);
  return this.findOne(query).skip(randomIndex);
};

const Puzzle = mongoose.model('Puzzle', puzzleSchema);

export default Puzzle;
