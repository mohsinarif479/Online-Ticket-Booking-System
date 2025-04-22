const express = require('express');
const Flight = require('../models/flight.model');
const router = express.Router();

// Get all flights with filtering
router.get('/', async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Flight.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }

        // Execute query
        const flights = await query;

        res.status(200).json({
            status: 'success',
            results: flights.length,
            data: {
                flights
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Get single flight
router.get('/:id', async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        
        if (!flight) {
            return res.status(404).json({
                status: 'fail',
                message: 'Flight not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                flight
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Create new flight (admin only)
router.post('/', async (req, res) => {
    try {
        const newFlight = await Flight.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                flight: newFlight
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Update flight status
router.patch('/:id', async (req, res) => {
    try {
        const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!flight) {
            return res.status(404).json({
                status: 'fail',
                message: 'Flight not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                flight
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Search flights
router.get('/search/available', async (req, res) => {
    try {
        const { departureCity, arrivalCity, departureDate, class: flightClass } = req.query;

        // Create date range for the selected date (entire day)
        const startDate = new Date(departureDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(departureDate);
        endDate.setHours(23, 59, 59, 999);

        const flights = await Flight.find({
            departureCity,
            arrivalCity,
            departureTime: {
                $gte: startDate,
                $lte: endDate
            },
            class: flightClass,
            availableSeats: { $gt: 0 },
            status: 'scheduled'
        });

        res.status(200).json({
            status: 'success',
            results: flights.length,
            data: {
                flights
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