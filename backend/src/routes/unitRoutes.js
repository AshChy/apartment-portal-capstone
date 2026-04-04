const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Get all units
router.get("/all", (req, res) => {
  const query = `
    SELECT unitId, unitNumber, bedrooms, rentAmount, availabilityStatus
    FROM ApartmentUnit
    ORDER BY unitNumber
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("All units fetch error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
});

// Get only available units
router.get("/available", (req, res) => {
  const query = `
    SELECT unitId, unitNumber, bedrooms, rentAmount, availabilityStatus
    FROM ApartmentUnit
    WHERE availabilityStatus = 'Available'
    ORDER BY unitNumber
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Available units fetch error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
});

module.exports = router;