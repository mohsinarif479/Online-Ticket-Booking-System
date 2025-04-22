const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true,
    unique: true
  },
  departureCity: {
    type: String,
    required: true
  },
  arrivalCity: {
    type: String,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  class: {
    type: String,
    required: true,
    enum: ['economy', 'business', 'first']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Flight', flightSchema); 