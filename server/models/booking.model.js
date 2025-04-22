const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user']
    },
    flight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: [true, 'Booking must belong to a flight']
    },
    passengers: [{
        firstName: {
            type: String,
            required: [true, 'First name is required']
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required']
        },
        seatNumber: {
            type: String,
            required: [true, 'Seat number is required']
        },
        passportNumber: {
            type: String,
            required: [true, 'Passport number is required']
        }
    }],
    bookingDate: {
        type: Date,
        default: Date.now
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required']
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'pending'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid'
    }
});

// Populate user and flight details when querying bookings
bookingSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'firstName lastName email phoneNumber'
    }).populate({
        path: 'flight',
        select: 'flightNumber airline departureCity arrivalCity departureTime arrivalTime'
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 