/**
 * AI Chess Service
 * Communicates with Python AI Service (FastAPI)
 */

import axios from 'axios';

// AI service URL (Python FastAPI service)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://ai-chess-service-41f27f1e88e9.herokuapp.com';
console.log('AI Service URL configured:', AI_SERVICE_URL);

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
    console.log('Checking AI health at:', AI_SERVICE_URL);
    const response = await aiClient.get('/health');
    console.log('AI health response:', response.data);
    return {
      status: 'ok',
      aiService: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('AI service health check failed:', error.message);
    console.error('Error details:', error.code, error.response?.status);
    return {
      status: 'error',
      message: 'AI service unavailable',
      error: error.message,
      url: AI_SERVICE_URL,
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
