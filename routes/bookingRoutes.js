const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit'); // Needs 'npm install pdfkit'
const Booking = require('../models/Booking');

// GET /api/bookings (History Page)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ booking_date: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/bookings/book
router.post('/book', async (req, res) => {
    const { passenger_name, flight_id, price_paid } = req.body;

    try {
        // 1. Generate Unique PNR
        const pnr = 'PNR-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

        // 2. Save Booking to DB
        const newBooking = new Booking({
            pnr,
            passenger_name,
            flight_id,
            amount_paid: price_paid
        });
        await newBooking.save();

        // 3. Generate PDF Ticket
        const doc = new PDFDocument();
        
        // Set headers so browser downloads it as a PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${pnr}.pdf`);

        // Pipe PDF directly to response
        doc.pipe(res);

        // PDF Content Design
        doc.fontSize(25).text('XTechon Flight Ticket', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(`Date: ${new Date().toLocaleString()}`);
        doc.moveDown();
        doc.fontSize(14).text('------------------------------------------------');
        doc.text(`Passenger Name:  ${passenger_name}`);
        doc.text(`Flight ID:       ${flight_id}`);
        doc.text(`PNR Number:      ${pnr}`);
        doc.text(`Total Paid:      Rs. ${price_paid}`);
        doc.text('------------------------------------------------');
        doc.moveDown();
        doc.fontSize(12).text('Thank you for booking with us!', { align: 'center' });

        doc.end(); // Finalize PDF

    } catch (err) {
        console.error(err);
        // If PDF generation fails, we still want to save the booking ideally, 
        // but for now we send 500.
        if (!res.headersSent) {
            res.status(500).json({ message: 'Booking failed' });
        }
    }
});

module.exports = router;