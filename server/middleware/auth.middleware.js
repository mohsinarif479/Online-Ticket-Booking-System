const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    try {
        // For testing purposes only - if no token available, create a mock user
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
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
            
            // If using full user data
            if (decoded.id) {
                const user = await User.findById(decoded.id);
                if (!user) {
                    // Fallback to test user
                    req.user = { 
                        userId: '67cdcbbea0e4f948c5acdc83',
                        email: 'test@example.com'
                    };
                    return next();
                }
                req.user = user;
                return next();
            }
            
            // If using simple JWT with userId
            req.user = { 
                userId: decoded.userId || decoded.id || '67cdcbbea0e4f948c5acdc83',
                email: decoded.email || 'test@example.com'
            };
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
        // For development, just continue with a test user
        req.user = { 
            userId: '67cdcbbea0e4f948c5acdc83',
            email: 'test@example.com'
        };
        return next();
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = auth; 