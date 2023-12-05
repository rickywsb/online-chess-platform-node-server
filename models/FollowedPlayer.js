import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const followedPlayerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chessPlayerUsername: {
    type: String,
    required: true
  },
  followedAt: {
    type: Date,
    default: Date.now
  }
});

const FollowedPlayer = mongoose.model('FollowedPlayer', followedPlayerSchema);

export default FollowedPlayer;
