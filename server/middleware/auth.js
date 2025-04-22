const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // For testing purposes only - if no token available, create a mock user
    // This should be removed in a production environment
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      console.log('No token provided. Using test user for development purposes only.');
      req.user = { 
        userId: '67cdcbbea0e4f948c5acdc83', // Default test user ID
        email: 'test@example.com'
      };
      return next();
    }

    // Normal token verification
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
      req.user = decoded;
      return next();
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      // For development purposes only - provide a test user
      req.user = { 
        userId: '67cdcbbea0e4f948c5acdc83', // Default test user ID
        email: 'test@example.com'
      };
      return next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = auth; 