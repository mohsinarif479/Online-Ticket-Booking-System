const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const auth = require('../middleware/auth.middleware');
const stripe = require('stripe')('sk_test_51RDTKhFbgHF00dO2GzV8MsRAZiZquqD5D84uIjofZPj03yyuVe2DfbMKtbSVvVcpAfixcMS3aM57waEjwvDaO4UU004XhDC0rO');

// Get all booked seats for a specific flight
router.get('/booked-seats/:flightId', async (req, res) => {
  try {
    const flightId = req.params.flightId;
    
    // Find all bookings for this flight that are not canceled
    const bookings = await Booking.find({
      flight: flightId,
      status: { $ne: 'canceled' }
    });
    
    // Extract all seat numbers from all passengers
    const bookedSeats = [];
    bookings.forEach(booking => {
      booking.passengers.forEach(passenger => {
        if (passenger.seatNumber) {
          bookedSeats.push(passenger.seatNumber);
        }
      });
    });
    
    res.json({
      success: true,
      data: {
        bookedSeats
      }
    });
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booked seats',
      error: error.message
    });
  }
});

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const { flight, passengers } = req.body;
    
    // Check if flight exists and has enough seats
    const flightData = await Flight.findById(flight);
    if (!flightData) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }
    
    if (flightData.availableSeats < passengers.length) {
      return res.status(400).json({
        success: false,
        message: 'Not enough available seats'
      });
    }
    
    // Verify seats are available
    const existingBookings = await Booking.find({
      flight,
      status: { $ne: 'canceled' }
    });
    
    const bookedSeats = [];
    existingBookings.forEach(booking => {
      booking.passengers.forEach(passenger => {
        if (passenger.seatNumber) {
          bookedSeats.push(passenger.seatNumber);
        }
      });
    });
    
    // Check if any of the selected seats are already booked
    const conflictingSeats = passengers.filter(p => 
      bookedSeats.includes(p.seatNumber)
    );
    
    if (conflictingSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The following seats are already booked: ${conflictingSeats.map(p => p.seatNumber).join(', ')}`
      });
    }
    
    // Calculate total price
    const totalPrice = flightData.price * passengers.length;
    
    // Create booking
    const booking = new Booking({
      user: req.user.userId,
      flight,
      passengers,
      totalPrice,
      status: 'pending'
    });
    
    await booking.save();
    
    // Update available seats on flight
    flightData.availableSeats -= passengers.length;
    await flightData.save();
    
    res.status(201).json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// Create a Stripe checkout session for a booking
router.post('/create-checkout-session/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('flight');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - not your booking'
      });
    }
    
    const flight = booking.flight;
    const passengers = booking.passengers;
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Flight ${flight.flightNumber} - ${flight.departureCity} to ${flight.arrivalCity}`,
              description: `${passengers.length} passenger(s), Class: ${flight.class}`,
            },
            unit_amount: Math.round(booking.totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/booking-success?id=${booking._id}`,
      cancel_url: `${req.headers.origin}/booking-canceled?id=${booking._id}`,
    });
    
    res.json({
      success: true,
      data: {
        id: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment session',
      error: error.message
    });
  }
});

// Get all bookings for the logged-in user
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate('flight')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: {
        bookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// Get a specific booking
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('flight');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if booking belongs to the logged-in user
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to booking'
      });
    }
    
    res.json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// Update booking status after payment
router.patch('/:id/update-status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'canceled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if booking belongs to the logged-in user
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this booking'
      });
    }
    
    booking.status = status;
    await booking.save();
    
    res.json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
});

module.exports = router; 