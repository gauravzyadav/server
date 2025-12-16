const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

// GET /api/flights/search
router.get('/search', async (req, res) => {
    try {
        const { from, to } = req.query;
        let query = {};
        
        // Case-insensitive search (e.g., "delhi" matches "Delhi")
        if (from) query.departure_city = { $regex: from, $options: 'i' };
        if (to) query.arrival_city = { $regex: to, $options: 'i' };

        // Debugging: Print to server console to see if request hits
        console.log("Searching with query:", query);

        const flights = await Flight.find(query).limit(10);
        res.json(flights);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/flights/check-price
// Handles Dynamic Pricing Logic
router.post('/check-price', async (req, res) => {
    const { flight_id } = req.body;
    
    try {
        const flight = await Flight.findOne({ flight_id });
        if (!flight) return res.status(404).json({ message: 'Flight not found' });

        const now = new Date();
        const fiveMinsAgo = new Date(now - 5 * 60000); // 5 minutes in ms
        const tenMinsAgo = new Date(now - 10 * 60000); // 10 minutes in ms

        let currentPrice = flight.base_price;

        // Rule 2: Reset price after 10 minutes
        if (flight.last_attempt_time && flight.last_attempt_time < tenMinsAgo) {
            flight.booking_attempts = 0;
        }

        // Rule 1: Increment attempts if within 5 minutes
        if (flight.last_attempt_time > fiveMinsAgo) {
            flight.booking_attempts += 1;
        } else {
            // New window starts
            flight.booking_attempts = 1;
        }

        // Apply Surge: If 3 or more attempts, increase by 10%
        if (flight.booking_attempts >= 3) {
            currentPrice = Math.floor(flight.base_price * 1.10);
        }

        // Update DB
        flight.last_attempt_time = now;
        await flight.save();

        res.json({
            flight_id: flight.flight_id,
            original_price: flight.base_price,
            current_price: currentPrice,
            surge_applied: currentPrice > flight.base_price
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;