const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.post("/maintenance-request", (req, res) => {
  const { title, description, userId, unitId } = req.body;

  if (!title || !userId || !unitId) {
    return res.status(400).json({
      message: "Title, userId, and unitId are required"
    });
  }

  const query = `
    INSERT INTO MaintenanceRequest (title, description, requestDate, status, userId, unitId)
    VALUES (?, ?, date('now'), ?, ?, ?)
  `;

  db.run(query, [title, description || "", "Pending", userId, unitId], function (err) {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({
      message: "Maintenance request submitted successfully",
      request: {
        requestId: this.lastID,
        title,
        description: description || "",
        status: "Pending",
        userId,
        unitId
      }
    });
  });
});

router.get("/maintenance-requests/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT requestId, title, description, status, requestDate
    FROM MaintenanceRequest
    WHERE userId = ?
    ORDER BY requestId DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
});

module.exports = router;