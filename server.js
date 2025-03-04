require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Enable CORS with more permissive configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));

// Add middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static('./'));
app.use(express.static(path.join(__dirname)));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Add OPTIONS handling for preflight requests
app.options('/submit-form', cors());

// Add a test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

app.post('/submit-form', upload.fields([
  { name: 'formPDF', maxCount: 1 },
  { name: 'invoices', maxCount: 10 }
]), async (req, res) => {
  try {
    console.log('Received form submission');
    
    if (!req.files || !req.files.formPDF) {
      console.error('No PDF file received');
      return res.status(400).json({ success: false, error: 'No PDF file received' });
    }

    console.log('Creating email transport');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    console.log('Preparing email options');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'saadalibespokedigital@gmail.com', 
      subject: 'NDIS Reimbursement Form Submission',
      text: 'A new NDIS reimbursement form has been submitted. Please find the form and any attachments below.',
      attachments: [
        {
          filename: 'NDIS_Reimbursement_Form.pdf',
          path: req.files.formPDF[0].path
        }
      ]
    }; 

    // Add any invoice attachments if present
    if (req.files.invoices) {
      mailOptions.attachments.push(
        ...req.files.invoices.map(file => ({
          filename: file.originalname,
          path: file.path
        }))
      );
    }

    console.log('Sending email');
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    // Clean up uploaded files
    const filesToDelete = [req.files.formPDF[0].path];
    if (req.files.invoices) {
      filesToDelete.push(...req.files.invoices.map(file => file.path));
    }
    
    filesToDelete.forEach(file => {
      fs.unlink(file, err => {
        if (err) console.error(`Error deleting file ${file}:`, err);
      });
    });

    res.status(200).json({ 
      success: true, 
      message: 'Form submitted successfully' 
    });
  } catch (error) {
    console.error('Error processing form:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error processing form submission' 
    });
  }
});

// Add this error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Using email:', process.env.EMAIL_USER);
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is busy. Trying again...`);
      setTimeout(startServer, 1000);
    } else {
      console.error('Server error:', error);
    }
  }
};

startServer();
