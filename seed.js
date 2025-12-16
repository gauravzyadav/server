const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
const Flight = require('./models/Flight');

// Connect to Database using the URL from your .env file
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB for seeding...'))
.catch(err => {
    console.error('❌ Connection Error:', err);
    process.exit(1);
});

const seedData = async () => {
    try {
        // 1. Clear existing data
        await Flight.deleteMany({});
        console.log('🗑️  Old flight data cleared.');

        // 2. Create 20 dummy flights
        const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
        const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara'];
        const flights = [];

        for (let i = 0; i < 20; i++) {
            // Pick random cities and airline
            const from = cities[Math.floor(Math.random() * cities.length)];
            let to = cities[Math.floor(Math.random() * cities.length)];
            
            // Ensure Departure and Arrival are different
            while (from === to) {
                to = cities[Math.floor(Math.random() * cities.length)];
            }

            flights.push({
                flight_id: `FL-${1000 + i}`,
                airline: airlines[Math.floor(Math.random() * airlines.length)],
                departure_city: from,
                arrival_city: to,
                base_price: Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000, // Random price 2000-3000
                booking_attempts: 0,
                last_attempt_time: null
            });
        }

        // 3. Insert them into the database
        await Flight.insertMany(flights);
        console.log('🚀 Successfully seeded 20 dummy flights!');

        // 4. Close the connection
        mongoose.connection.close();
        process.exit();

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();