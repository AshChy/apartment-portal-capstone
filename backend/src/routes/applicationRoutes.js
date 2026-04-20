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

router.put("/:applicationId/accept-lease", (req, res) => {
  const { applicationId } = req.params;

  const getApplicationQuery = `
    SELECT
      a.applicationId,
      a.userId,
      a.unitId,
      a.status,
      a.moveInDate,
      u.rentAmount
    FROM Application a
    JOIN ApartmentUnit u ON a.unitId = u.unitId
    WHERE a.applicationId = ?
  `;

  db.get(getApplicationQuery, [applicationId], (appErr, application) => {
    if (appErr) {
      console.error("Lease accept lookup error:", appErr.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "Approved") {
      return res.status(400).json({
        message: "Only approved applications can accept a lease"
      });
    }

    const checkLeaseQuery = `
      SELECT leaseId
      FROM Lease
      WHERE applicationId = ?
    `;

    db.get(checkLeaseQuery, [applicationId], (leaseCheckErr, existingLease) => {
      if (leaseCheckErr) {
        console.error("Lease check error:", leaseCheckErr.message);
        return res.status(500).json({ message: "Failed to check existing lease" });
      }

      if (existingLease) {
        return res.status(400).json({
          message: "A lease has already been created for this application"
        });
      }

      const updateUserQuery = `
        UPDATE User
        SET role = 'resident'
        WHERE userId = ?
      `;

      db.run(updateUserQuery, [application.userId], function (userErr) {
        if (userErr) {
          console.error("User role update error:", userErr.message);
          return res.status(500).json({ message: "Failed to update user role" });
        }

        const updateUnitQuery = `
          UPDATE ApartmentUnit
          SET availabilityStatus = 'Occupied'
          WHERE unitId = ?
        `;

        db.run(updateUnitQuery, [application.unitId], function (unitErr) {
          if (unitErr) {
            console.error("Unit status update error:", unitErr.message);
            return res.status(500).json({ message: "Failed to update unit status" });
          }

          const startDate = application.moveInDate;
          const start = new Date(startDate);
          const end = new Date(start);
          end.setFullYear(end.getFullYear() + 1);

          const endDate = end.toISOString().split("T")[0];

          const insertLeaseQuery = `
            INSERT INTO Lease (
              applicationId,
              tenantUserId,
              unitId,
              startDate,
              endDate,
              monthlyRent,
              leaseStatus
            )
            VALUES (?, ?, ?, ?, ?, ?, 'Active')
          `;

          db.run(
            insertLeaseQuery,
            [
              application.applicationId,
              application.userId,
              application.unitId,
              startDate,
              endDate,
              application.rentAmount
            ],
            function (leaseErr) {
              if (leaseErr) {
                console.error("Lease insert error:", leaseErr.message);
                return res.status(500).json({ message: "Failed to create lease" });
              }

              return res.json({
                message: "Lease accepted successfully",
                userId: application.userId,
                newRole: "resident",
                unitId: application.unitId,
                leaseId: this.lastID
              });
            }
          );
        });
      });
    });
  });
});

module.exports = router;