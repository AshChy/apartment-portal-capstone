const express = require("express");
const router = express.Router();
const db = require("../db/database");

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

module.exports = router;