/**
 * AI Chess Service
 * Communicates with Python AI Service (FastAPI)
 */

import axios from 'axios';

// AI service URL (Python FastAPI service)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Create axios instance
const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Health check - Check if AI service is running properly
 */
async function healthCheck() {
  try {
    const response = await aiClient.get('/health');
    return {
      status: 'ok',
      aiService: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('AI service health check failed:', error.message);
    return {
      status: 'error',
      message: 'AI service unavailable',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Analyze chess position
 * @param {string} fen - FEN format chess position string
 * @returns {Promise<object>} Analysis result
 */
async function analyzePosition(fen) {
  try {
    const response = await aiClient.post('/analyze', { fen });
    return response.data;
  } catch (error) {
    console.error('Position analysis failed:', error.message);
    if (error.response) {
      throw new Error(error.response.data.detail || 'Position analysis failed');
    }
    throw new Error('AI service connection failed');
  }
}

/**
 * Get best move
 * @param {string} fen - FEN format chess position string
 * @returns {Promise<object>} Best move result
 */
async function getBestMove(fen) {
  try {
    const response = await aiClient.post('/best-move', { fen });
    return response.data;
  } catch (error) {
    console.error('Get best move failed:', error.message);
    if (error.response) {
      throw new Error(error.response.data.detail || 'Get best move failed');
    }
    throw new Error('AI service connection failed');
  }
}

export default {
  healthCheck,
  analyzePosition,
  getBestMove,
};
