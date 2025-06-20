const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = function(req, res, next) {
  try {
    // Get token from header or cookie
    const token = req.header('x-auth-token') || req.cookies.token;

    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token, access denied' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      
      // Add user from payload
      req.user = decoded.user;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error in auth middleware' 
    });
  }
}; 