const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database_helper");

const app = express();
app.use(express.json());

const SECRET_KEY = "mysecretkey";

// Register API
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO registeruser (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === "23505") {
      // PostgreSQL error code for duplicate entry
      return res.status(400).json({ error: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM registeruser WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Profile API
app.get("/profile", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    res.json({ message: "Profile data", user });
  });
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
