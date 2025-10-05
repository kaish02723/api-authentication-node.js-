// database_helper.js
require('dotenv').config();  // dotenv load kar do

const mysql2DB = require('mysql2');

const pool = mysql2DB.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

pool.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log(' Connected to the database.');
});

module.exports = pool;
