const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Get all maintenance requests
router.get("/maintenance-requests", (req, res) => {
  const query = `
    SELECT
      mr.requestId,
      mr.title,
      mr.description,
      mr.requestDate,
      mr.status,
      u.name AS residentName,
      u.email AS residentEmail,
      a.unitNumber
    FROM MaintenanceRequest mr
    JOIN User u ON mr.userId = u.userId
    JOIN ApartmentUnit a ON mr.unitId = a.unitId
    ORDER BY mr.requestId DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Admin maintenance fetch error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
});

// Create a new admin user
router.post("/create-admin", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required"
    });
  }

  const checkQuery = `
    SELECT userId
    FROM User
    WHERE email = ?
  `;

  db.get(checkQuery, [email], (checkErr, existingUser) => {
    if (checkErr) {
      console.error("Admin check user error:", checkErr.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (existingUser) {
      return res.status(409).json({
        message: "A user with that email already exists"
      });
    }

    const insertQuery = `
      INSERT INTO User (name, email, password, role)
      VALUES (?, ?, ?, 'admin')
    `;

    db.run(insertQuery, [name, email, password], function (insertErr) {
      if (insertErr) {
        console.error("Admin create user error:", insertErr.message);
        return res.status(500).json({ message: "Failed to create admin user" });
      }

      res.status(201).json({
        message: "Admin account created successfully",
        user: {
          userId: this.lastID,
          name,
          email,
          role: "admin"
        }
      });
    });
  });
});

module.exports = router;