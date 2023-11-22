import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const isStudentMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedData = jwt.verify(token, 'yourverylongrandomstringthatishardtoguess');

    const user = await User.findById(decodedData.id);

    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }

    req.userId = decodedData.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default isStudentMiddleware;
