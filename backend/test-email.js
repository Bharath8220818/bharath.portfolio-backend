const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

console.log('--- Email Connection Test ---');
console.log(`Using Email: ${process.env.EMAIL_USER}`);
console.log(`Password Length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0} characters`);

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    } else {
        console.log('✅ Connection successful! Transporter is ready.');
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Sending to self for testing
            subject: 'Test Email from Portfolio Backend',
            text: 'If you are reading this, your Nodemailer configuration is working correctly!',
        };

        console.log('Sending test email...');
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Failed to send test email:', error.message);
                process.exit(1);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('Message ID:', info.messageId);
                process.exit(0);
            }
        });
    }
});
