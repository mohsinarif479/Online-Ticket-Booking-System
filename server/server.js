const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Airline Booking System API' });
});

// Test route for checking database status
app.get('/api/status', (req, res) => {
    res.json({
        server: 'running',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://l211763:mohsin123@cluster0.2wthpzf.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Server will continue running without database connection');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/bookings', require('./routes/bookings'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the API at http://localhost:${PORT}`);
    console.log(`Check status at http://localhost:${PORT}/api/status`);
}); 