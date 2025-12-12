require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Allow requests from React frontend

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));