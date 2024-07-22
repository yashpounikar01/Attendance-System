const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Correctly import the MySQL connection config

// Register route
router.post('/register', (req, res) => {
    const { username, password, adminCode } = req.body;

    // Replace 'your_admin_code' with your actual admin code
    if (adminCode !== 'your_admin_code') {
        return res.status(400).json({ success: false, message: 'Invalid admin code' });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).json({ success: false, message: 'Error hashing password' });
        } else {
            const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertUserQuery, [username, hashedPassword], (err) => {
                if (err) {
                    console.error('Error registering user:', err);
                    res.status(500).json({ success: false, message: 'Error registering user' });
                } else {
                    res.status(200).json({ success: true, message: 'User registered successfully' });
                }
            });
        }
    });
});

// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const findUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(findUserQuery, [username], (err, results) => {
        if (err) {
            console.error('Error finding user:', err);
            res.status(500).json({ success: false, message: 'Error finding user' });
        } else if (results.length === 0) {
            res.status(404).json({ success: false, message: 'User not found' });
        } else {
            const hashedPassword = results[0].password;
            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    res.status(500).json({ success: false, message: 'Error comparing passwords' });
                } else if (!isMatch) {
                    res.status(401).json({ success: false, message: 'Incorrect password' });
                } else {
                    req.session.user = username; // Example using express-session
                    res.status(200).json({ success: true, message: 'Login successful' });
                }
            });
        }
    });
});

module.exports = router;
