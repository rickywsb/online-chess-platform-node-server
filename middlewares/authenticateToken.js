import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("Received token:", token); // Add this line

    const decodedData = jwt.verify(token, 'yourSecretKey');

    const user = await User.findById(decodedData.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // Add the user object to the request
    next();
  } catch (error) {
    console.error("Error in token authentication:", error);

    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default authenticateToken;
