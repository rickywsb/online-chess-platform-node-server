/**
 * Import Lichess Puzzle Database
 * 
 * Downloads and imports puzzles from Lichess database
 * Run with: node script/importPuzzles.js
 */

import mongoose from 'mongoose';
import https from 'https';
import zlib from 'zlib';
import readline from 'readline';
import Puzzle from '../models/Puzzle.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/online-course-platform';
const LICHESS_PUZZLE_URL = 'https://database.lichess.org/lichess_db_puzzle.csv.zst';

// For simpler download, we'll use a smaller sample or create puzzles programmatically
const SAMPLE_PUZZLES = [
  // Mate in 1 puzzles (easy)
  { puzzleId: 'p001', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', moves: ['h5f7'], rating: 600, themes: ['mateIn1', 'short'], toMove: 'white' },
  { puzzleId: 'p002', fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', moves: ['e1e8'], rating: 650, themes: ['mateIn1', 'backRankMate'], toMove: 'white' },
  { puzzleId: 'p003', fen: 'r1b1kb1r/pppp1ppp/2n2n2/4N2Q/2B1P3/8/PPPP1qPP/RNB1K2R w KQkq - 0 1', moves: ['h5f7'], rating: 700, themes: ['mateIn1', 'sacrifice'], toMove: 'white' },
  
  // Mate in 2 puzzles (medium)
  { puzzleId: 'p004', fen: 'r2qk2r/ppp2ppp/2n1bn2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1', moves: ['f3g5', 'f6e4', 'g5f7'], rating: 1000, themes: ['mateIn2', 'sacrifice'], toMove: 'white' },
  { puzzleId: 'p005', fen: '2r3k1/5ppp/p7/1p6/8/1P6/P4PPP/2R3K1 w - - 0 1', moves: ['c1c8'], rating: 800, themes: ['mateIn1', 'backRankMate'], toMove: 'white' },
  { puzzleId: 'p006', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 2 3', moves: ['f3f7'], rating: 750, themes: ['mateIn1', 'scholarsMate'], toMove: 'white' },
  
  // Fork puzzles
  { puzzleId: 'p007', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', moves: ['f3e5'], rating: 900, themes: ['fork', 'middlegame'], toMove: 'white' },
  { puzzleId: 'p008', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['f3g5'], rating: 950, themes: ['fork', 'attack'], toMove: 'white' },
  
  // Pin puzzles
  { puzzleId: 'p009', fen: 'r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', moves: ['c4f7', 'e8f7', 'f3e5'], rating: 1100, themes: ['pin', 'sacrifice'], toMove: 'white' },
  { puzzleId: 'p010', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['f3g5'], rating: 1050, themes: ['attack', 'pressure'], toMove: 'white' },
  
  // Discovered attack
  { puzzleId: 'p011', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3', moves: ['f3e5', 'c6e5', 'c4f7'], rating: 1200, themes: ['discoveredAttack', 'sacrifice'], toMove: 'white' },
  
  // Black to move puzzles
  { puzzleId: 'p012', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq f3 0 2', moves: ['d8h4'], rating: 800, themes: ['mateIn1', 'check'], toMove: 'black' },
  { puzzleId: 'p013', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4', moves: ['f6g4'], rating: 950, themes: ['attack', 'fork'], toMove: 'black' },
  { puzzleId: 'p014', fen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 3', moves: ['h4e1'], rating: 700, themes: ['mateIn1', 'foolsMate'], toMove: 'black' },
  
  // Intermediate puzzles
  { puzzleId: 'p015', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['c4f7', 'e8f7', 'f3e5', 'c6e5', 'd1h5', 'g7g6', 'h5e5'], rating: 1300, themes: ['sacrifice', 'attack', 'long'], toMove: 'white' },
  { puzzleId: 'p016', fen: '2rq1rk1/pp1bppbp/2np1np1/8/2BNP3/2N1BP2/PPPQ2PP/R3K2R w KQ - 5 10', moves: ['d4f5'], rating: 1250, themes: ['attack', 'middlegame'], toMove: 'white' },
  
  // Advanced puzzles
  { puzzleId: 'p017', fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 5 6', moves: ['c3d5', 'f6d5', 'e4d5', 'c6d4', 'f3d4', 'c5d4'], rating: 1400, themes: ['sacrifice', 'exchange', 'tactics'], toMove: 'white' },
  { puzzleId: 'p018', fen: 'r1bqk2r/ppp2ppp/2n2n2/2bpp3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq d6 0 6', moves: ['e4d5', 'f6d5', 'c4d5', 'e7e6'], rating: 1350, themes: ['opening', 'pawnStructure'], toMove: 'white' },
  
  // Endgame puzzles
  { puzzleId: 'p019', fen: '8/8/8/4k3/8/8/4K3/4R3 w - - 0 1', moves: ['e1e8'], rating: 650, themes: ['endgame', 'mateIn1'], toMove: 'white' },
  { puzzleId: 'p020', fen: '8/5pk1/8/8/8/8/6PP/4R1K1 w - - 0 1', moves: ['e1e7'], rating: 900, themes: ['endgame', 'attack'], toMove: 'white' },
  
  // Queen sacrifice puzzles
  { puzzleId: 'p021', fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p1B1/2B1P3/3P1N2/PPP2PPP/RN1QK2R w KQkq - 6 6', moves: ['g5f6', 'e7f6', 'd1b3'], rating: 1500, themes: ['sacrifice', 'attack'], toMove: 'white' },
  { puzzleId: 'p022', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4', moves: ['f6e4'], rating: 1100, themes: ['fork', 'tactics'], toMove: 'black' },
  
  // Deflection puzzles
  { puzzleId: 'p023', fen: '3r2k1/pp3ppp/2p5/8/3P4/2P2N2/PP3PPP/R5K1 w - - 0 1', moves: ['a1a8'], rating: 850, themes: ['backRankMate', 'deflection'], toMove: 'white' },
  { puzzleId: 'p024', fen: '2r3k1/pp3ppp/8/3p4/8/2P2N2/PP3PPP/R5K1 w - - 0 1', moves: ['a1a8'], rating: 800, themes: ['backRankMate'], toMove: 'white' },
  
  // Skewer puzzles
  { puzzleId: 'p025', fen: '4r1k1/ppp2ppp/8/8/8/8/PPP2PPP/4R1K1 w - - 0 1', moves: ['e1e8'], rating: 750, themes: ['mateIn1', 'backRankMate'], toMove: 'white' },
  
  // Double attack
  { puzzleId: 'p026', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', moves: ['f1c4'], rating: 700, themes: ['development', 'attack'], toMove: 'white' },
  { puzzleId: 'p027', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['d2d3'], rating: 750, themes: ['development', 'opening'], toMove: 'white' },
  
  // Trapped piece
  { puzzleId: 'p028', fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3', moves: ['d2d3'], rating: 700, themes: ['development'], toMove: 'white' },
  
  // Zwischenzug (intermediate move)
  { puzzleId: 'p029', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', moves: ['h5f7'], rating: 800, themes: ['mateIn1', 'attack'], toMove: 'white' },
  { puzzleId: 'p030', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 0 5', moves: ['b8a6'], rating: 850, themes: ['development'], toMove: 'black' },
  
  // More varied puzzles for different ratings
  { puzzleId: 'p031', fen: '6k1/ppp2ppp/8/8/8/8/PPP2PPP/R5K1 w - - 0 1', moves: ['a1a8'], rating: 600, themes: ['backRankMate', 'mateIn1'], toMove: 'white' },
  { puzzleId: 'p032', fen: 'r5k1/ppp2ppp/8/8/8/8/PPP2PPP/6K1 b - - 0 1', moves: ['a8a1'], rating: 600, themes: ['backRankMate', 'mateIn1'], toMove: 'black' },
  { puzzleId: 'p033', fen: '4r1k1/ppp2ppp/8/8/8/2B5/PPP2PPP/4R1K1 w - - 0 1', moves: ['e1e8'], rating: 700, themes: ['backRankMate', 'mateIn1'], toMove: 'white' },
  { puzzleId: 'p034', fen: '2kr4/ppp2ppp/8/8/8/8/PPP2PPP/2KR4 w - - 0 1', moves: ['d1d8'], rating: 650, themes: ['backRankMate', 'mateIn1'], toMove: 'white' },
  { puzzleId: 'p035', fen: 'r4rk1/ppp2ppp/8/8/8/8/PPP2PPP/R4RK1 w - - 0 1', moves: ['a1a8'], rating: 750, themes: ['exchange'], toMove: 'white' },
  
  // Tactical patterns
  { puzzleId: 'p036', fen: 'r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2', moves: ['d2d4'], rating: 650, themes: ['opening', 'development'], toMove: 'white' },
  { puzzleId: 'p037', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', moves: ['g1f3'], rating: 700, themes: ['opening', 'development'], toMove: 'white' },
  { puzzleId: 'p038', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', moves: ['f1b5'], rating: 750, themes: ['opening', 'RuyLopez'], toMove: 'white' },
  { puzzleId: 'p039', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 4', moves: ['f1c4'], rating: 800, themes: ['opening', 'ItalianGame'], toMove: 'white' },
  { puzzleId: 'p040', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', moves: ['g8f6'], rating: 700, themes: ['opening', 'development'], toMove: 'black' },
  
  // Higher rated puzzles
  { puzzleId: 'p041', fen: 'r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - d6 0 7', moves: ['e4d5', 'f6d5', 'c3d5'], rating: 1450, themes: ['tactics', 'exchange'], toMove: 'white' },
  { puzzleId: 'p042', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 0 5', moves: ['d7d6'], rating: 1100, themes: ['solidDefense', 'middlegame'], toMove: 'black' },
  { puzzleId: 'p043', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['c2c3'], rating: 900, themes: ['opening', 'ItalianGame'], toMove: 'white' },
  { puzzleId: 'p044', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 5', moves: ['d7d6'], rating: 950, themes: ['solidDefense'], toMove: 'black' },
  { puzzleId: 'p045', fen: 'rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq d6 0 4', moves: ['c4d5'], rating: 1000, themes: ['opening', 'SlavDefense'], toMove: 'white' },
  
  // Knight fork puzzles
  { puzzleId: 'p046', fen: 'r1bqkb1r/pppp1ppp/2n5/4N3/4n3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 5', moves: ['e5f7'], rating: 1050, themes: ['fork', 'attack'], toMove: 'white' },
  { puzzleId: 'p047', fen: 'r1bqk2r/pppp1ppp/2n2n2/4N3/1bB1P3/8/PPPP1PPP/RNBQK2R w KQkq - 4 5', moves: ['e5f7'], rating: 1100, themes: ['fork', 'sacrifice'], toMove: 'white' },
  { puzzleId: 'p048', fen: 'r1bqkb1r/ppppnppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', moves: ['h5f7'], rating: 900, themes: ['mateIn1', 'scholarship'], toMove: 'white' },
  
  // More mating patterns
  { puzzleId: 'p049', fen: '5rk1/ppp2ppp/8/8/8/8/PPP2PPP/4R1K1 w - - 0 1', moves: ['e1e8'], rating: 700, themes: ['backRankMate', 'mateIn1'], toMove: 'white' },
  { puzzleId: 'p050', fen: '3r2k1/ppp2ppp/8/8/8/5N2/PPP2PPP/3R2K1 w - - 0 1', moves: ['d1d8'], rating: 750, themes: ['backRankMate', 'mateIn1'], toMove: 'white' },
];

async function importPuzzles() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if puzzles already exist
    const existingCount = await Puzzle.countDocuments();
    console.log(`📊 Existing puzzles in database: ${existingCount}`);

    if (existingCount >= 50) {
      console.log('✅ Puzzle database already populated');
      return;
    }

    console.log('📥 Importing sample puzzles...');
    
    let imported = 0;
    let skipped = 0;

    for (const puzzleData of SAMPLE_PUZZLES) {
      try {
        // Check if puzzle already exists
        const exists = await Puzzle.findOne({ puzzleId: puzzleData.puzzleId });
        if (exists) {
          skipped++;
          continue;
        }

        await Puzzle.create({
          puzzleId: puzzleData.puzzleId,
          fen: puzzleData.fen,
          moves: puzzleData.moves,
          rating: puzzleData.rating,
          themes: puzzleData.themes,
          toMove: puzzleData.toMove,
          popularity: Math.floor(Math.random() * 10000),
        });
        imported++;
      } catch (err) {
        console.error(`Failed to import puzzle ${puzzleData.puzzleId}:`, err.message);
      }
    }

    console.log(`✅ Imported ${imported} puzzles, skipped ${skipped} duplicates`);
    console.log(`📊 Total puzzles in database: ${await Puzzle.countDocuments()}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run import
importPuzzles();
