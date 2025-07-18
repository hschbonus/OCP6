const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       req.auth = { userId };
       console.log('auth ok', req.auth);
       next();
   } catch(error) {
       console.log('auth error', error);
       res.status(401).json({ error });
   }
};
