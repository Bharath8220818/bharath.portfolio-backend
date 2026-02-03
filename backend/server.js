const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
    res.send('Backend API is running');
});

// Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working correctly' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Import Model (Create this file next if not exists)
const Message = require('./models/Message');

// Resend Initialization
const resend = new Resend(process.env.RESEND_API_KEY);


// API Route: Handle Contact Form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // 1. Save to MongoDB - This is our primary record
        const newMessage = new Message({ name, email, message });
        await newMessage.save();
        console.log('✅ Message saved to MongoDB');

        // 2. Try to send Email - This is a convenience notification
        let emailStatus = 'sent';
        try {
            await resend.emails.send({
                from: "Portfolio <onboarding@resend.dev>",
                to: [process.env.EMAIL_USER],
                subject: `New Portfolio Message from ${name}`,
                html: `
                    <h3>New Portfolio Message</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong> ${message}</p>
                `,
            });
            console.log('✅ Notification email sent');
        } catch (emailError) {
            console.error('⚠️ Email sending failed:', emailError.message);
            emailStatus = `failed: ${emailError.message}`;
        }

        res.status(200).json({
            success: true,
            message: emailStatus === 'sent' ? 'Message received and email sent!' : 'Message received but email failed to send',
            emailStatus: emailStatus
        });
    } catch (dbError) {
        console.error('❌ Database Error:', dbError);
        res.status(500).json({ success: false, message: 'Failed to save message to database', error: dbError.message });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
