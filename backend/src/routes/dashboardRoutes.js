const db = require("../db/database");
const express = require("express");
const router = express.Router();

router.get("/tenant-dashboard/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT
      u.name,
      a.unitId,
      au.unitNumber,
      au.rentAmount
    FROM User u
    JOIN Application a ON u.userId = a.userId
    JOIN ApartmentUnit au ON a.unitId = au.unitId
    WHERE u.userId = ?
      AND u.role = 'resident'
    ORDER BY a.applicationId DESC
    LIMIT 1
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      return res.status(404).json({ message: "Resident data not found" });
    }

    res.json({
      tenant: {
        name: row.name,
        unitId: row.unitId,
        unitNumber: row.unitNumber
      },
      rentStatus: {
        amountDue: row.rentAmount,
        dueDate: "2026-04-10"
      },
      utilities: {
        amountDue: 85.20,
        dueDate: "2026-04-10"
      }
    });
  });
});

router.get("/announcements", (req, res) => {
  db.all("SELECT * FROM Announcement", [], (err, rows) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows);
  });
});

router.get("/users", (req, res) => {
  db.all("SELECT * FROM User", [], (err, rows) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows);
  });
});

module.exports = router;