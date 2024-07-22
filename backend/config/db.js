// Load environment variables from the .env file
require('dotenv').config();

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'your_password', // Provide a default or use the env variable
    database: process.env.MYSQLDATABASE || 'attendance_system',
    port: process.env.MYSQLPORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
    console.log('MySQL Connected...');
});

module.exports = db;
