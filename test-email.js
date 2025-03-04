require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('Email user:', process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        },
        debug: true
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test Sender" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // sending to yourself for testing
            subject: "Test Email",
            text: "If you receive this, the email configuration is working!"
        });

        console.log('Message sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

testEmail(); 