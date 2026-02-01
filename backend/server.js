const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Import Model (Create this file next if not exists)
const Message = require('./models/Message');

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify Transporter on Start
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email Transporter Error:', error.message);
        if (error.message.includes('535')) {
            console.error('👉 TIP: This error (535) means your Gmail App Password is invalid. Please double check .env');
        }
    } else {
        console.log('✅ Email Transporter is ready');
    }
});

// API Route: Handle Contact Form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // 1. Save to MongoDB - This is our primary record
        const newMessage = new Message({ name, email, message });
        await newMessage.save();
        console.log('✅ Message saved to MongoDB');

        // 2. Try to send Email - This is a convenience notification
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: `New Portfolio Message from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
                html: `<h3>New Portfolio Message</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
            };
            await transporter.sendMail(mailOptions);
            console.log('✅ Notification email sent');
        } catch (emailError) {
            console.error('⚠️ Email sending failed:', emailError.message);
            // We don't fail the whole request if only the email fails
        }

        res.status(200).json({ message: 'Message received successfully!' });
    } catch (dbError) {
        console.error('❌ Database Error:', dbError);
        res.status(500).json({ message: 'Failed to save message to database', error: dbError.message });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
