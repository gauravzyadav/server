const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flight_id: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    departure_city: { type: String, required: true },
    arrival_city: { type: String, required: true },
    base_price: { type: Number, required: true },
    
    // Dynamic Pricing Fields
    booking_attempts: { type: Number, default: 0 },
    last_attempt_time: { type: Date, default: null }
});

module.exports = mongoose.model('Flight', flightSchema);