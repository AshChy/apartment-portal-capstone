const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  const query = `
    SELECT userId, name, email, role
    FROM User
    WHERE email = ? AND password = ?
  `;

  db.get(query, [email, password], (err, user) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user
    });
  });
});

// Register new applicant or resident
router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      message: "Email, password, and role are required"
    });
  }

  const allowedRoles = ["applicant", "resident"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Only applicant or resident accounts can be created here"
    });
  }

  const cleanName =
    name && name.trim() ? name.trim() : email.split("@")[0];

  const checkQuery = `
    SELECT userId
    FROM User
    WHERE email = ?
  `;

  db.get(checkQuery, [email], (checkErr, existingUser) => {
    if (checkErr) {
      console.error("Register check error:", checkErr.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (existingUser) {
      return res.status(409).json({
        message: "An account with that email already exists"
      });
    }

    const insertQuery = `
      INSERT INTO User (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    db.run(insertQuery, [cleanName, email, password, role], function (insertErr) {
      if (insertErr) {
        console.error("Register insert error:", insertErr.message);
        return res.status(500).json({ message: "Failed to create account" });
      }

      res.status(201).json({
        message: "Account created successfully",
        user: {
          userId: this.lastID,
          name: cleanName,
          email,
          role
        }
      });
    });
  });
});

module.exports = router;