const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Get application(s) for a specific user
router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT
      a.applicationId,
      a.userId,
      a.unitId,
      a.submissionDate,
      a.status,
      a.moveInDate,
      a.income,
      u.unitNumber,
      u.bedrooms,
      u.rentAmount
    FROM Application a
    JOIN ApartmentUnit u ON a.unitId = u.unitId
    WHERE a.userId = ?
    ORDER BY a.applicationId DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("Application fetch error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
});

// Submit a new application
router.post("/", (req, res) => {
  const { userId, unitId, moveInDate, income } = req.body;

  if (!userId || !unitId || !moveInDate || !income) {
    return res.status(400).json({
      message: "userId, unitId, moveInDate, and income are required"
    });
  }

  const checkExistingQuery = `
    SELECT applicationId
    FROM Application
    WHERE userId = ?
  `;

  db.get(checkExistingQuery, [userId], (checkErr, existingApplication) => {
    if (checkErr) {
      console.error("Application check error:", checkErr.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (existingApplication) {
      return res.status(409).json({
        message: "This user already has an application on file"
      });
    }

    const insertQuery = `
      INSERT INTO Application (userId, unitId, submissionDate, status, moveInDate, income)
      VALUES (?, ?, date('now'), 'Pending', ?, ?)
    `;

    db.run(insertQuery, [userId, unitId, moveInDate, income], function (insertErr) {
      if (insertErr) {
        console.error("Application insert error:", insertErr.message);
        return res.status(500).json({ message: "Failed to submit application" });
      }

      res.status(201).json({
        message: "Application submitted successfully",
        applicationId: this.lastID
      });
    });
  });
});

module.exports = router;