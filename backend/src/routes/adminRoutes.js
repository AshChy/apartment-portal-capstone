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

// Get real application review queue
router.get("/applications/review-queue", (req, res) => {
  const query = `
    SELECT
      a.applicationId,
      a.submissionDate,
      a.status,
      a.moveInDate,
      a.income,
      u.userId,
      u.name AS applicantName,
      u.email AS applicantEmail,
      ap.unitId,
      ap.unitNumber,
      ap.bedrooms,
      ap.rentAmount
    FROM Application a
    JOIN User u ON a.userId = u.userId
    JOIN ApartmentUnit ap ON a.unitId = ap.unitId
    ORDER BY
      CASE
        WHEN a.status = 'Pending' THEN 0
        WHEN a.status = 'Approved' THEN 1
        ELSE 2
      END,
      a.applicationId DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Admin application review queue error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(rows);
  });
});

// Update application status
router.put("/applications/:applicationId/status", (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["Pending", "Approved", "Rejected"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status value"
    });
  }

  const query = `
    UPDATE Application
    SET status = ?
    WHERE applicationId = ?
  `;

  db.run(query, [status, applicationId], function (err) {
    if (err) {
      console.error("Application status update error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      message: "Application status updated successfully"
    });
  });
});

// Reassign an application to a different unit
router.put("/applications/:applicationId/reassign-unit", (req, res) => {
  const { applicationId } = req.params;
  const { newUnitId } = req.body;

  if (!newUnitId) {
    return res.status(400).json({
      message: "newUnitId is required"
    });
  }

  const checkUnitQuery = `
    SELECT unitId, availabilityStatus
    FROM ApartmentUnit
    WHERE unitId = ?
  `;

  db.get(checkUnitQuery, [newUnitId], (unitErr, unitRow) => {
    if (unitErr) {
      console.error("Unit lookup error:", unitErr.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (!unitRow) {
      return res.status(404).json({ message: "Target unit not found" });
    }

    if (unitRow.availabilityStatus !== "Available") {
      return res.status(400).json({
        message: "Target unit is not currently available"
      });
    }

    const updateQuery = `
      UPDATE Application
      SET unitId = ?
      WHERE applicationId = ?
    `;

    db.run(updateQuery, [newUnitId, applicationId], function (updateErr) {
      if (updateErr) {
        console.error("Application reassignment error:", updateErr.message);
        return res.status(500).json({ message: "Failed to reassign application" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json({
        message: "Application reassigned successfully"
      });
    });
  });
});

router.get("/inventory-summary", (req, res) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM ApartmentUnit) AS totalUnits,
      (SELECT COUNT(*) FROM ApartmentUnit WHERE availabilityStatus = 'Available') AS vacantReady,
      (SELECT COUNT(*) FROM ApartmentUnit WHERE availabilityStatus = 'Occupied') AS occupied,
      (
        SELECT COUNT(DISTINCT a.unitId)
        FROM Application a
        JOIN ApartmentUnit u ON a.unitId = u.unitId
        WHERE a.status = 'Approved'
          AND u.availabilityStatus = 'Available'
      ) AS pendingLease
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      console.error("Inventory summary error:", err.message);
      return res.status(500).json({ message: "Failed to load inventory summary" });
    }

    res.json(row);
  });
});

module.exports = router;