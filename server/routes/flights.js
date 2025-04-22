const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

// Get available flights based on search criteria
router.get('/search/available', async (req, res) => {
  try {
    const { departureCity, arrivalCity, departureDate, class: flightClass } = req.query;
    
    console.log('Search Parameters:', {
      departureCity,
      arrivalCity,
      departureDate,
      flightClass
    });

    // Create base query for available seats
    const query = {
      availableSeats: { $gt: 0 }
    };

    // Add filters only if they are provided
    if (departureCity && departureCity.trim() !== '') {
      query.departureCity = new RegExp(departureCity, 'i');
    }

    if (arrivalCity && arrivalCity.trim() !== '') {
      query.arrivalCity = new RegExp(arrivalCity, 'i');
    }

    if (flightClass && flightClass.trim() !== '') {
      query.class = flightClass;
    }

    // Add date filter if provided
    if (departureDate && departureDate.trim() !== '') {
      const startDate = new Date(departureDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(departureDate);
      endDate.setHours(23, 59, 59, 999);

      query.departureTime = {
        $gte: startDate,
        $lte: endDate
      };
    }

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

    const flights = await Flight.find(query).sort('departureTime');
    
    console.log(`Found ${flights.length} flights`);

    res.json({
      success: true,
      data: { flights }
    });
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching flights',
      error: error.message
    });
  }
});

// Get a specific flight by ID
router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }
    res.json({
      success: true,
      data: { flight }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching flight',
      error: error.message
    });
  }
});

module.exports = router; 