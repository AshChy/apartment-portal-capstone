const express = require("express");
const router = express.Router();
const db = require("../db/database");

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

module.exports = router;