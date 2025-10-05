const express=require('express');
const jwt=require('jsonwebtoken');
const app=express();
const bcrypt=require('bcrypt');

const databaseHelper=require('./database_helper');
const db=databaseHelper;
app.use(express.json());


const SECRET_KEY='mysecretkey';


// Register API
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO registeruser (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "Email already registered" });
                }
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "User registered successfully" });
        });
});



// Login API
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM registeruser WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];

        console.log("Entered Password:", password);
        console.log("DB Password:", user.password);

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Match Result:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    });
});



app.get("/profile", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        res.json({ message: "Profile data", user });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



/*
overview:
This code sets up a basic Express.js server with API endpoints for user registration, login, and profile retrieval.

It uses bcrypt for password hashing and jsonwebtoken for JWT token generation and verification.

The server connects to a MySQL database to store and retrieve user information.

Key functionalities:
1. User Registration (/register):
    - Accepts name, email, and password in the request body.
    - Hashes the password using bcrypt before storing it in the database.   
    - Checks for duplicate email entries and handles errors appropriately.
2. User Login (/login):
    - Accepts email and password in the request body.
    - Retrieves the user from the database based on the provided email.
    - Compares the provided password with the hashed password stored in the database using bcrypt.
    - If the password matches, generates a JWT token that includes user information and sends it in the response.
3. Profile Retrieval (/profile):
    - Requires an Authorization header with a Bearer token.
    - Verifies the JWT token and, if valid, returns the user's profile information.
4. Error Handling:
    - Handles various error scenarios, including missing fields, database errors, invalid credentials, and token issues.
5. Server Setup:
    - Listens on port 3000 and logs a message when the server is running.

*/



/* package.json

{
    "name": "api-authentication",
    "version": "1.0.0",
    "description": "A simple API authentication service using Node.js, Express, MySQL, bcrypt, and JWT.",
    "main": "auth_service_helper.js",
    "scripts": {
        "start": "node auth_service_helper.js", 
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "Your Name",
    "license": "ISC",
    "dependencies": {
        "bcrypt": "^5.1.0",
        "body-parser": "^1.20.2",
        "express": "^4.18.2",
        "jsonwebtoken": "^9.0.0",
        "mysql2": "^3.3.1"
    }
}





// To install dependencies, run: npm install
// To start the server, run: npm start
// Ensure you have Node.js and npm installed on your machine.
// This package.json file sets up a basic Node.js project for an API authentication service.  
// It includes essential dependencies like Express for server handling, bcrypt for password hashing, jsonwebtoken for JWT handling, and mysql2 for database interactions.
// The scripts section includes commands to start the server and run tests.
// You can customize the name, version, author, and other fields as needed for your project.
// mysql2 is a MySQL client for Node.js with focus on performance.
// bcrypt is a library to help you hash passwords.
// body-parser is Node.js body parsing middleware.
// express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
// jsonwebtoken is a library to work with JSON Web Tokens.
// The "start" script runs the auth_service_helper.js file, which should contain your server code.
// kyu mysql2 ko add kiye h dependencies me taki hum mysql database se connect kar ske. or bcrypt ko isliye add kiye h taki hum passwords ko securely hash kar ske.
// body-parser ko isliye add kiye h taki hum incoming request bodies ko parse kar ske.
// express ko isliye add kiye h taki hum apna server bana ske or routes handle kar ske.
// jsonwebtoken ko isliye add kiye h taki hum JWT tokens create or verify kar ske. Ye authentication ke liye use hota h. 
// Ye sab dependencies milke ek complete authentication service banate h.

*/

