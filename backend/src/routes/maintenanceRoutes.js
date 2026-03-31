const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.post("/maintenance-request", (req, res) => {
  const { title, description, userId } = req.body;

  if (!title || !userId) {
    return res.status(400).json({
      message: "Title and userId are required"
    });
  }

  const leaseQuery = `
    SELECT unitId
    FROM Lease
    WHERE tenantUserId = ?
    LIMIT 1
  `;

  db.get(leaseQuery, [userId], (err, lease) => {
    if (err) {
      console.error("Lease lookup error:", err.message);
      return res.status(500).json({ message: "Database error during lease lookup" });
    }

    if (!lease) {
      return res.status(404).json({ message: "No lease found for this user" });
    }

    const insertQuery = `
      INSERT INTO MaintenanceRequest (title, description, requestDate, status, userId, unitId)
      VALUES (?, ?, date('now'), 'Pending', ?, ?)
    `;

    db.run(insertQuery, [title, description || "", userId, lease.unitId], function (insertErr) {
      if (insertErr) {
        console.error("Insert error:", insertErr.message);
        return res.status(500).json({ message: "Database error while creating request" });
      }

      res.status(201).json({
        message: "Maintenance request submitted successfully",
        request: {
          requestId: this.lastID,
          title,
          description: description || "",
          status: "Pending",
          userId,
          unitId: lease.unitId
        }
      });
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