const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    pnr: { type: String, unique: true, required: true },
    passenger_name: { type: String, required: true },
    flight_id: { type: String, required: true },
    amount_paid: { type: Number, required: true },
    booking_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);