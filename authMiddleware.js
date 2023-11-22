import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500; // Check if the token is a custom token or OAuth token

    let decodedData;

    if (token && isCustomAuth) {      
      decodedData = jwt.verify(token, 'yourverylongrandomstringthatishardtoguess');

      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);

      req.userId = decodedData?.sub;
    }    

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
