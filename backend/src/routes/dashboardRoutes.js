const db = require("../db/database");
const express = require("express");
const router = express.Router();

router.get("/tenant-dashboard/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT
      u.name,
      l.leaseId,
      l.unitId,
      l.startDate,
      l.endDate,
      l.leaseStatus,
      au.unitNumber,
      au.rentAmount
    FROM User u
    JOIN Lease l ON u.userId = l.tenantUserId
    JOIN ApartmentUnit au ON l.unitId = au.unitId
    WHERE u.userId = ?
      AND u.role = 'resident'
      AND l.leaseStatus = 'Active'
    ORDER BY l.leaseId DESC
    LIMIT 1
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!row) {
      return res.json({
        hasActiveLease: false,
        message: "No active lease found for this resident."
      });
    }

    res.json({
      hasActiveLease: true,
      tenant: {
        name: row.name,
        leaseId: row.leaseId,
        unitId: row.unitId,
        unitNumber: row.unitNumber,
        startDate: row.startDate,
        endDate: row.endDate,
        leaseStatus: row.leaseStatus
      },
      rentStatus: {
        amountDue: row.rentAmount,
        dueDate: "2026-04-10"
      },
      utilities: {
        amountDue: 85.2,
        dueDate: "2026-04-10"
      }
    });
  });
});

router.put("/tenant-dashboard/:userId/move-out", (req, res) => {
  const { userId } = req.params;

  const findLeaseQuery = `
    SELECT leaseId, unitId
    FROM Lease
    WHERE tenantUserId = ?
      AND leaseStatus = 'Active'
    ORDER BY leaseId DESC
    LIMIT 1
  `;

  db.get(findLeaseQuery, [userId], (leaseErr, lease) => {
    if (leaseErr) {
      console.error("Move-out lease lookup error:", leaseErr.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (!lease) {
      return res.status(404).json({ message: "No active lease found for this user" });
    }

    const updateLeaseQuery = `
      UPDATE Lease
      SET leaseStatus = 'Ended',
          endDate = date('now')
      WHERE leaseId = ?
    `;

    db.run(updateLeaseQuery, [lease.leaseId], function (updateLeaseErr) {
      if (updateLeaseErr) {
        console.error("Move-out lease update error:", updateLeaseErr.message);
        return res.status(500).json({ message: "Failed to end lease" });
      }

      const updateUnitQuery = `
        UPDATE ApartmentUnit
        SET availabilityStatus = 'Available'
        WHERE unitId = ?
      `;

      db.run(updateUnitQuery, [lease.unitId], function (unitErr) {
        if (unitErr) {
          console.error("Move-out unit update error:", unitErr.message);
          return res.status(500).json({ message: "Failed to update unit" });
        }

        res.json({
          message: "Move out completed successfully"
        });
      });
    });
  });
});

router.get("/announcements", (req, res) => {
  const query = `
    SELECT announcementId, title, message, postDate, userId
    FROM Announcement
    ORDER BY announcementId DESC
  `;

  db.all(query, [], (err, rows) => {
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