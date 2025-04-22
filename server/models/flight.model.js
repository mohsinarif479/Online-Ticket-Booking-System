const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: [true, 'Flight number is required'],
        unique: true,
        trim: true
    },
    airline: {
        type: String,
        required: [true, 'Airline name is required'],
        trim: true
    },
    departureCity: {
        type: String,
        required: [true, 'Departure city is required'],
        trim: true
    },
    arrivalCity: {
        type: String,
        required: [true, 'Arrival city is required'],
        trim: true
    },
    departureTime: {
        type: Date,
        required: [true, 'Departure time is required']
    },
    arrivalTime: {
        type: Date,
        required: [true, 'Arrival time is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    totalSeats: {
        type: Number,
        required: [true, 'Total seats are required'],
        min: [0, 'Total seats cannot be negative']
    },
    availableSeats: {
        type: Number,
        required: true,
        min: [0, 'Available seats cannot be negative']
    },
    class: {
        type: String,
        enum: ['economy', 'business', 'first'],
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'delayed', 'cancelled'],
        default: 'scheduled'
    }
});

// Virtual for checking if flight is full
flightSchema.virtual('isFull').get(function() {
    return this.availableSeats === 0;
});

// Method to update available seats
flightSchema.methods.updateAvailableSeats = function(bookedSeats) {
    this.availableSeats -= bookedSeats;
    return this.save();
};

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight; 