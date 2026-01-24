import axios from 'axios';

const LICHESS_API = 'https://lichess.org/api';

class BroadcastService {
  /**
   * Get list of current broadcasts from Lichess
   * Lichess returns NDJSON (newline-delimited JSON), so we need to parse it
   */
  async getBroadcasts(page = 1) {
    try {
      const response = await axios.get(`${LICHESS_API}/broadcast`, {
        params: { nb: 20, page },
        headers: {
          'Accept': 'application/x-ndjson'
        },
        responseType: 'text'
      });
      
      // Parse NDJSON: split by newlines and parse each line as JSON
      const broadcasts = response.data
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            console.error('Failed to parse line:', line);
            return null;
          }
        })
        .filter(item => item !== null);
      
      return broadcasts;
    } catch (error) {
      console.error('Error fetching broadcasts:', error.message);
      throw error;
    }
  }

  /**
   * Get a specific broadcast tournament
   */
  async getBroadcastTournament(broadcastId) {
    try {
      const response = await axios.get(`${LICHESS_API}/broadcast/${broadcastId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching broadcast tournament:', error.message);
      throw error;
    }
  }

  /**
   * Get a specific round of a broadcast
   */
  async getBroadcastRound(broadcastTournamentId, broadcastRoundId) {
    try {
      const response = await axios.get(
        `${LICHESS_API}/broadcast/-/-/${broadcastRoundId}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching broadcast round:', error.message);
      throw error;
    }
  }

  /**
   * Get PGN of a broadcast round
   */
  async getBroadcastPgn(broadcastTournamentId, broadcastRoundId) {
    try {
      // Lichess PGN endpoint uses the main site, not the API
      const response = await axios.get(
        `https://lichess.org/broadcast/-/-/${broadcastRoundId}.pgn`,
        {
          headers: {
            'Accept': 'application/x-chess-pgn'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching broadcast PGN:', error.message);
      throw error;
    }
  }

  /**
   * Parse PGN string into game objects
   */
  parsePgn(pgnString) {
    if (!pgnString) return [];
    
    const games = [];
    const gameStrings = pgnString.split(/\n\n(?=\[Event)/);
    
    for (const gameStr of gameStrings) {
      if (!gameStr.trim()) continue;
      
      const game = {
        headers: {},
        moves: ''
      };
      
      // Parse headers
      const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
      let match;
      while ((match = headerRegex.exec(gameStr)) !== null) {
        game.headers[match[1]] = match[2];
      }
      
      // Parse moves (everything after the headers)
      const movesMatch = gameStr.match(/\]\s*\n\n([\s\S]*?)(?:\s*(?:1-0|0-1|1\/2-1\/2|\*)?\s*$)/);
      if (movesMatch) {
        game.moves = movesMatch[1].replace(/\{[^}]*\}/g, '').trim();
      }
      
      if (game.headers.White && game.headers.Black) {
        games.push(game);
      }
    }
    
    return games;
  }

  /**
   * Get top live broadcasts (featured)
   */
  async getTopBroadcasts() {
    try {
      const response = await axios.get(`${LICHESS_API}/broadcast/top`, {
        params: { nb: 10 },
        headers: {
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top broadcasts:', error.message);
      // Fallback to regular broadcasts
      return this.getBroadcasts(1);
    }
  }
}

export default new BroadcastService();
