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

// Function to check if column exists
function checkColumnExists(tableName, columnName, callback) {
    const checkColumnQuery = `
        SELECT COUNT(*) AS count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = '${tableName}'
        AND column_name = '${columnName}'
    `;
    db.query(checkColumnQuery, (err, results) => {
        if (err) {
            console.error('Error checking column:', err);
            callback(err, false);
        } else {
            const columnExists = results[0].count > 0;
            callback(null, columnExists);
        }
    });
}

// POST route to mark attendance
router.post('/mark-attendance', (req, res) => {
    const { lectureName, rollNumbers, attendanceDate } = req.body;
    const rollNoArray = rollNumbers.split(',').map(num => num.trim());
    const columnName = `${attendanceDate}`; // Use attendanceDate for dynamic column name

    // Query to create lecture table if not exists
    const createLectureTableQuery = `
        CREATE TABLE IF NOT EXISTS \`${lectureName}\` (
            roll_no INT,
            student_name VARCHAR(100),
            total_attendance INT DEFAULT 0,
            PRIMARY KEY (roll_no)
        );
    `;

    // Execute create table query
    db.query(createLectureTableQuery, (err) => {
        if (err) {
            console.error('Error creating lecture table:', err);
            res.status(500).json({ success: false, message: 'Failed to create lecture table' });
        } else {
            // Query to insert students into lecture table or update existing entries
            const insertStudentsQuery = `
                INSERT INTO \`${lectureName}\` (roll_no, student_name)
                SELECT roll_no, student_name FROM students
                WHERE roll_no IN (?)
                ON DUPLICATE KEY UPDATE student_name = VALUES(student_name);
            `;
            
            // Execute insert students query
            db.query(insertStudentsQuery, [rollNoArray], (err) => {
                if (err) {
                    console.error('Error inserting students:', err);
                    res.status(500).json({ success: false, message: 'Failed to insert students into lecture table' });
                } else {
                    // Check if column exists before adding it
                    checkColumnExists(lectureName, columnName, (err, columnExists) => {
                        if (err) {
                            console.error('Error checking column existence:', err);
                            res.status(500).json({ success: false, message: 'Failed to check column existence' });
                        } else if (!columnExists) {
                            // Query to add column for attendanceDate
                            const addColumnQuery = `
                                ALTER TABLE \`${lectureName}\`
                                ADD COLUMN \`${columnName}\` BOOLEAN DEFAULT FALSE;
                            `;
                            
                            // Execute add column query
                            db.query(addColumnQuery, (err) => {
                                if (err) {
                                    console.error('Error adding column:', err);
                                    res.status(500).json({ success: false, message: 'Failed to add column for attendance date' });
                                } else {
                                    // Query to mark attendance for roll numbers on specific date
                                    const markAttendanceQuery = `
                                        UPDATE \`${lectureName}\`
                                        SET \`${columnName}\` = TRUE, total_attendance = total_attendance + 1
                                        WHERE roll_no IN (?);
                                    `;
                                    
                                    // Execute mark attendance query
                                    db.query(markAttendanceQuery, [rollNoArray], (err) => {
                                        if (err) {
                                            console.error('Error marking attendance:', err);
                                            res.status(500).json({ success: false, message: 'Failed to mark attendance' });
                                        } else {
                                            res.status(200).json({ success: true, message: 'Attendance marked successfully' });
                                        }
                                    });
                                }
                            });
                        } else {
                            // Column already exists, proceed to mark attendance
                            const markAttendanceQuery = `
                                UPDATE \`${lectureName}\`
                                SET \`${columnName}\` = TRUE, total_attendance = total_attendance + 1
                                WHERE roll_no IN (?);
                            `;
                            
                            // Execute mark attendance query
                            db.query(markAttendanceQuery, [rollNoArray], (err) => {
                                if (err) {
                                    console.error('Error marking attendance:', err);
                                    res.status(500).json({ success: false, message: 'Failed to mark attendance' });
                                } else {
                                    res.status(200).json({ success: true, message: 'Attendance marked successfully' });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
