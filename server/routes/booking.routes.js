const express = require('express');
const Booking = require('../models/booking.model');
const Flight = require('../models/flight.model');
const router = express.Router();

// Create new booking
router.post('/', async (req, res) => {
    try {
        // Check if flight exists and has available seats
        const flight = await Flight.findById(req.body.flight);
        if (!flight) {
            return res.status(404).json({
                status: 'fail',
                message: 'Flight not found'
            });
        }

        if (flight.availableSeats < req.body.passengers.length) {
            return res.status(400).json({
                status: 'fail',
                message: 'Not enough seats available'
            });
        }

        // Calculate total amount
        const totalAmount = flight.price * req.body.passengers.length;

        // Create booking
        const newBooking = await Booking.create({
            ...req.body,
            totalAmount
        });

        // Update available seats
        await flight.updateAvailableSeats(req.body.passengers.length);

        res.status(201).json({
            status: 'success',
            data: {
                booking: newBooking
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Get user's bookings
router.get('/my-bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id });

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: {
                bookings
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Get single booking
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                status: 'fail',
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                booking
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Cancel booking
router.patch('/:id/cancel', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                status: 'fail',
                message: 'Booking not found'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                status: 'fail',
                message: 'Booking is already cancelled'
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        await booking.save();

        // Restore available seats
        const flight = await Flight.findById(booking.flight);
        if (flight) {
            flight.availableSeats += booking.passengers.length;
            await flight.save();
        }

        res.status(200).json({
            status: 'success',
            data: {
                booking
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Update booking payment status
router.patch('/:id/payment', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { paymentStatus: 'paid', status: 'confirmed' },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                status: 'fail',
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                booking
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

module.exports = router; 