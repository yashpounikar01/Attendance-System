const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Load environment variables from the .env file
require('dotenv').config();

// MySQL connection configuration
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'your_password', // Provide a default or use the env variable
    database: process.env.MYSQLDATABASE || 'attendance_system',
    port: process.env.MYSQLPORT || 3306
});

// Connect to MySQL database
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
    console.log('MySQL Connected...');
});

// GET route to fetch all students
router.get('/', (req, res) => {
    const query = 'SELECT * FROM students';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            res.status(500).send('Error fetching students');
        } else {
            res.send(results);
        }
    });
});

module.exports = router;
