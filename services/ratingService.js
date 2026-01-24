/**
 * Rating Service - Glicko-2 simplified implementation
 * Used for calculating puzzle and battle ratings
 */

// Constants for Glicko-2
const INITIAL_RATING = 1200;
const INITIAL_RD = 350;
const MIN_RD = 30;
const MAX_RD = 350;
const C = 34.6;  // Rating deviation increase over time
const Q = Math.log(10) / 400;

/**
 * Calculate expected score
 * @param {number} playerRating 
 * @param {number} opponentRating 
 * @param {number} playerRD 
 * @returns {number} Expected score (0-1)
 */
function expectedScore(playerRating, opponentRating, playerRD) {
  const g = 1 / Math.sqrt(1 + 3 * Math.pow(Q * playerRD / Math.PI, 2));
  const E = 1 / (1 + Math.pow(10, -g * (playerRating - opponentRating) / 400));
  return E;
}

/**
 * Calculate new rating after a puzzle attempt
 * @param {number} currentRating - Player's current rating
 * @param {number} currentRD - Player's current rating deviation
 * @param {number} puzzleRating - Puzzle difficulty rating
 * @param {boolean} solved - Whether the puzzle was solved
 * @returns {object} { newRating, newRD, ratingChange }
 */
function calculatePuzzleRating(currentRating, currentRD, puzzleRating, solved) {
  const score = solved ? 1 : 0;
  const expected = expectedScore(currentRating, puzzleRating, currentRD);
  
  // K-factor based on RD (higher RD = more volatile rating)
  const K = Math.min(64, Math.max(16, currentRD / 5));
  
  // Calculate rating change
  const ratingChange = Math.round(K * (score - expected));
  const newRating = Math.max(100, currentRating + ratingChange);
  
  // Update RD (decreases with each game played)
  const newRD = Math.max(MIN_RD, Math.min(MAX_RD, currentRD * 0.95));
  
  return {
    newRating,
    newRD,
    ratingChange,
    expected: Math.round(expected * 100) / 100
  };
}

/**
 * Calculate new rating after a battle game
 * @param {number} currentRating - Player's current rating
 * @param {number} currentRD - Player's current rating deviation
 * @param {number} opponentRating - Opponent's rating
 * @param {number} opponentRD - Opponent's rating deviation
 * @param {string} result - 'win', 'loss', or 'draw'
 * @returns {object} { newRating, newRD, ratingChange }
 */
function calculateBattleRating(currentRating, currentRD, opponentRating, opponentRD, result) {
  const scoreMap = { win: 1, draw: 0.5, loss: 0 };
  const score = scoreMap[result];
  
  if (score === undefined) {
    throw new Error('Invalid result. Must be "win", "loss", or "draw"');
  }
  
  const expected = expectedScore(currentRating, opponentRating, currentRD);
  
  // K-factor based on RD
  const K = Math.min(64, Math.max(16, currentRD / 5));
  
  // Bonus for beating higher-rated opponent
  const ratingDiff = opponentRating - currentRating;
  const upsetBonus = (result === 'win' && ratingDiff > 100) ? Math.floor(ratingDiff / 50) : 0;
  
  const ratingChange = Math.round(K * (score - expected)) + upsetBonus;
  const newRating = Math.max(100, currentRating + ratingChange);
  
  // Update RD
  const newRD = Math.max(MIN_RD, Math.min(MAX_RD, currentRD * 0.95));
  
  return {
    newRating,
    newRD,
    ratingChange,
    expected: Math.round(expected * 100) / 100
  };
}

/**
 * Increase RD over time (rating becomes less certain)
 * Call this when user hasn't played in a while
 * @param {number} currentRD 
 * @param {number} daysSinceLastGame 
 * @returns {number} New RD
 */
function increaseRDOverTime(currentRD, daysSinceLastGame) {
  const newRD = Math.sqrt(Math.pow(currentRD, 2) + Math.pow(C, 2) * daysSinceLastGame);
  return Math.min(MAX_RD, newRD);
}

/**
 * Get rating tier/title based on rating
 * @param {number} rating 
 * @returns {object} { tier, title, color }
 */
function getRatingTier(rating) {
  if (rating >= 2400) return { tier: 'master', title: 'Master', color: '#FFD700' };
  if (rating >= 2200) return { tier: 'expert', title: 'Expert', color: '#C0C0C0' };
  if (rating >= 2000) return { tier: 'classA', title: 'Class A', color: '#CD7F32' };
  if (rating >= 1800) return { tier: 'classB', title: 'Class B', color: '#4CAF50' };
  if (rating >= 1600) return { tier: 'classC', title: 'Class C', color: '#2196F3' };
  if (rating >= 1400) return { tier: 'classD', title: 'Class D', color: '#9C27B0' };
  if (rating >= 1200) return { tier: 'classE', title: 'Class E', color: '#607D8B' };
  return { tier: 'beginner', title: 'Beginner', color: '#795548' };
}

export default {
  INITIAL_RATING,
  INITIAL_RD,
  calculatePuzzleRating,
  calculateBattleRating,
  increaseRDOverTime,
  getRatingTier,
  expectedScore
};
