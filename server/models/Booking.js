const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  passengers: [{
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    passportNumber: {
      type: String,
      required: true
    },
    seatNumber: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'canceled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  user: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema); 