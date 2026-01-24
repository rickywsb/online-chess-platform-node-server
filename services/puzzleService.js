/**
 * Puzzle Service - Local Database + Lichess Fallback
 */

import axios from 'axios';
import { Chess } from 'chess.js';
import Puzzle from '../models/Puzzle.js';

const LICHESS_API = 'https://lichess.org/api';

const lichessClient = axios.create({
  baseURL: LICHESS_API,
  timeout: 10000,
  headers: { 'Accept': 'application/json' }
});

/**
 * Get a random puzzle from local database by rating
 */
async function getRandomPuzzle(targetRating = 1200) {
  try {
    // Try to get from local database first
    const localPuzzle = await Puzzle.getRandomByRating(targetRating, 300);
    if (localPuzzle) {
      console.log('Serving puzzle from local database');
      // Increment play count
      localPuzzle.plays += 1;
      await localPuzzle.save();
      
      return formatLocalPuzzle(localPuzzle);
    }
  } catch (err) {
    console.log('Local database error:', err.message);
  }
  
  // Fallback to Lichess
  console.log('Falling back to Lichess API');
  return getDailyPuzzle();
}

/**
 * Get daily puzzle from Lichess
 */
async function getDailyPuzzle() {
  try {
    const response = await lichessClient.get('/puzzle/daily');
    return formatLichessPuzzle(response.data);
  } catch (error) {
    console.error('Failed to fetch from Lichess:', error.message);
    // Try local database as fallback
    try {
      const localPuzzle = await Puzzle.getRandomByRating(1200, 500);
      if (localPuzzle) {
        return formatLocalPuzzle(localPuzzle);
      }
    } catch (err) {
      console.error('Local fallback failed:', err.message);
    }
    throw new Error('Failed to fetch puzzle from all sources');
  }
}

/**
 * Get puzzle by theme
 */
async function getPuzzleByTheme(theme, targetRating = 1200) {
  try {
    const puzzle = await Puzzle.getRandomByTheme(theme, targetRating);
    if (puzzle) {
      puzzle.plays += 1;
      await puzzle.save();
      return formatLocalPuzzle(puzzle);
    }
    // Fallback to random puzzle
    return getRandomPuzzle(targetRating);
  } catch (error) {
    console.error('Error fetching puzzle by theme:', error.message);
    return getRandomPuzzle(targetRating);
  }
}

/**
 * Get puzzle by ID (local or Lichess)
 */
async function getPuzzleById(puzzleId) {
  try {
    // Check local database first
    const localPuzzle = await Puzzle.findOne({ puzzleId });
    if (localPuzzle) {
      return formatLocalPuzzle(localPuzzle);
    }
    
    // Try Lichess
    const response = await lichessClient.get('/puzzle/' + puzzleId);
    return formatLichessPuzzle(response.data);
  } catch (error) {
    console.error('Failed to fetch puzzle:', error.message);
    throw new Error('Puzzle not found');
  }
}

/**
 * Get next puzzle (for authenticated users)
 */
async function getNextPuzzle(userRating = 1200, lastPuzzleId = null) {
  try {
    // Get random puzzle close to user's rating
    const query = { rating: { $gte: userRating - 200, $lte: userRating + 200 } };
    if (lastPuzzleId) {
      query.puzzleId = { $ne: lastPuzzleId };
    }
    
    const count = await Puzzle.countDocuments(query);
    if (count === 0) {
      return getDailyPuzzle();
    }
    
    const randomIndex = Math.floor(Math.random() * count);
    const puzzle = await Puzzle.findOne(query).skip(randomIndex);
    
    if (puzzle) {
      puzzle.plays += 1;
      await puzzle.save();
      return formatLocalPuzzle(puzzle);
    }
    
    return getDailyPuzzle();
  } catch (error) {
    console.error('Error in getNextPuzzle:', error.message);
    return getDailyPuzzle();
  }
}

/**
 * Get available themes
 */
async function getAvailableThemes() {
  try {
    const themes = await Puzzle.distinct('themes');
    return themes.sort();
  } catch (error) {
    return ['mateIn1', 'mateIn2', 'fork', 'pin', 'backRankMate', 'sacrifice'];
  }
}

/**
 * Get puzzle stats
 */
async function getPuzzleStats() {
  try {
    const total = await Puzzle.countDocuments();
    const ratingDistribution = await Puzzle.aggregate([
      {
        $bucket: {
          groupBy: '$rating',
          boundaries: [0, 800, 1000, 1200, 1400, 1600, 1800, 2000, 3000],
          default: 'other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);
    return { total, ratingDistribution };
  } catch (error) {
    return { total: 0, ratingDistribution: [] };
  }
}

// Helper: Format local puzzle
function formatLocalPuzzle(puzzle) {
  return {
    id: puzzle.puzzleId,
    fen: puzzle.fen,
    moves: puzzle.moves,
    rating: puzzle.rating,
    themes: puzzle.themes || [],
    plays: puzzle.plays || 0,
    toMove: puzzle.toMove,
    moveCount: puzzle.moves?.length || 0,
    source: 'local'
  };
}

// Helper: Parse FEN at ply from Lichess PGN
function getFenAtPly(pgn, ply) {
  try {
    const chess = new Chess();
    const moves = pgn.trim().split(/\s+/).filter(move => !move.match(/^\d+\.+$/) && move.length > 0);
    
    for (let i = 0; i < ply && i < moves.length; i++) {
      const result = chess.move(moves[i]);
      if (!result) break;
    }
    return chess.fen();
  } catch (error) {
    console.error('Error parsing PGN:', error.message);
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
}

// Helper: Format Lichess puzzle
function formatLichessPuzzle(lichessPuzzle) {
  const { puzzle, game } = lichessPuzzle;
  
  let puzzleFen;
  if (game && game.pgn && puzzle.initialPly !== undefined) {
    puzzleFen = getFenAtPly(game.pgn, puzzle.initialPly);
  } else {
    puzzleFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
  
  const toMove = puzzleFen.split(' ')[1] === 'w' ? 'white' : 'black';
  
  return {
    id: puzzle.id,
    fen: puzzleFen,
    moves: puzzle.solution,
    rating: puzzle.rating,
    themes: puzzle.themes || [],
    plays: puzzle.plays,
    gameUrl: game ? 'https://lichess.org/' + game.id : null,
    toMove: toMove,
    moveCount: puzzle.solution?.length || 0,
    initialPly: puzzle.initialPly,
    source: 'lichess'
  };
}

// Helper: Validate user move
function validateMove(solution, userMove, moveIndex) {
  const expectedMove = solution[moveIndex];
  const isCorrect = expectedMove && expectedMove.toLowerCase() === userMove.toLowerCase();
  const isFinished = isCorrect && moveIndex >= solution.length - 1;
  const nextOpponentMove = isCorrect && moveIndex + 1 < solution.length ? solution[moveIndex + 1] : null;
  
  return { correct: isCorrect, finished: isFinished, nextOpponentMove, expectedMove };
}

const puzzleService = {
  getDailyPuzzle,
  getRandomPuzzle,
  getNextPuzzle,
  getPuzzleById,
  getPuzzleByTheme,
  getAvailableThemes,
  getPuzzleStats,
  validateMove,
  formatLocalPuzzle,
  formatLichessPuzzle
};

export default puzzleService;
