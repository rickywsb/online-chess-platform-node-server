import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  players: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User'  // 参与对局的用户
  }],
  result: { type: String },  // 比如 '1-0', '0-1', '1/2-1/2'
  moves: [{ type: String }],  // 棋步记录
  createdAt: { type: Date, default: Date.now }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
