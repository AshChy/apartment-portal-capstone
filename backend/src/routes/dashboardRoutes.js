const db = require("../db/database");
const express = require("express");
const router = express.Router();

router.get("/tenant-dashboard", (req, res) => {
  const userId = 2; // temp hardcoded user

  const query = `
    SELECT u.name, l.monthlyRent, l.startDate, l.endDate
    FROM User u
    JOIN Lease l ON u.userId = l.tenantUserId
    WHERE u.userId = ?
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      tenant: {
        name: row.name
      },
      rentStatus: {
        amountDue: row.monthlyRent,
        dueDate: row.endDate
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