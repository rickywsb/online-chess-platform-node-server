import jwt from 'jsonwebtoken';
import User from './models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("Received token:", token);

    const decodedData = jwt.verify(token, 'yourSecretKey');
    console.log("Decoded data:", decodedData);

    if (!decodedData) {
      throw new Error('Token decoding failed');
    }

    const user = await User.findById(decodedData.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in token authentication:", error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default authMiddleware;
