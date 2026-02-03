const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const testEmail = async () => {
    console.log('Testing Resend with API Key:', process.env.RESEND_API_KEY ? 'Present (ending in ...' + process.env.RESEND_API_KEY.slice(-4) + ')' : 'MISSING');

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
        console.error('❌ Error: RESEND_API_KEY is not set or is still the placeholder in .env');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Portfolio <onboarding@resend.dev>',
            to: [process.env.EMAIL_USER],
            subject: 'Test Email from Resend',
            html: '<p>If you see this, Resend is working correctly! 🚀</p>',
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
        } else {
            console.log('✅ Email sent successfully!', data);
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err.message);
    }
};

testEmail();
