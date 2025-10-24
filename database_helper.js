const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // ye .env ke variable ke naam ke same rakho
  ssl: {
    rejectUnauthorized: false  // Render ke PostgreSQL ke liye SSL zaroori hai
  }
});

pool.connect()
  .then(() => {
    console.log("Connected to PostgreSQL database.");
  })
  .catch(err => {
    console.error(" Database connection failed:", err);
  });

module.exports = pool;
