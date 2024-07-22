const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path'); // Import path module
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Load environment variables from .env file

const authRouter = require('./routes/auth');
const lectureRouter = require('./routes/lecture');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Use environment variable or default
    resave: false,
    saveUninitialized: false
}));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Serve the HTML page at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});

// Routes
app.use('/auth', authRouter);
app.use('/lecture', lectureRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
