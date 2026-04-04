const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Save or update document metadata
router.post("/", (req, res) => {
  const { fileName, documentType, applicationId } = req.body;

  if (!fileName || !documentType || !applicationId) {
    return res.status(400).json({
      message: "fileName, documentType, and applicationId are required"
    });
  }

  const allowedTypes = ["Paystub 1", "Paystub 2", "Driver License / ID"];

  if (!allowedTypes.includes(documentType)) {
    return res.status(400).json({
      message: "Invalid document type"
    });
  }

  const checkQuery = `
    SELECT documentId
    FROM Document
    WHERE applicationId = ? AND documentType = ?
  `;

  db.get(checkQuery, [applicationId, documentType], (checkErr, existingDoc) => {
    if (checkErr) {
      console.error("Document check error:", checkErr.message);
      return res.status(500).json({ message: "Failed to check existing document" });
    }

    if (existingDoc) {
      const updateQuery = `
        UPDATE Document
        SET fileName = ?, uploadDate = date('now')
        WHERE documentId = ?
      `;

      db.run(updateQuery, [fileName, existingDoc.documentId], function (updateErr) {
        if (updateErr) {
          console.error("Document update error:", updateErr.message);
          return res.status(500).json({ message: "Failed to update document metadata" });
        }

        return res.json({
          message: "Document metadata updated successfully",
          documentId: existingDoc.documentId
        });
      });
    } else {
      const insertQuery = `
        INSERT INTO Document (fileName, documentType, uploadDate, applicationId)
        VALUES (?, ?, date('now'), ?)
      `;

      db.run(insertQuery, [fileName, documentType, applicationId], function (insertErr) {
        if (insertErr) {
          console.error("Document insert error:", insertErr.message);
          return res.status(500).json({ message: "Failed to save document metadata" });
        }

        return res.status(201).json({
          message: "Document metadata saved successfully",
          documentId: this.lastID
        });
      });
    }
  });
});

// Get documents for a specific application
router.get("/application/:applicationId", (req, res) => {
  const { applicationId } = req.params;

  const query = `
    SELECT
      documentId,
      fileName,
      documentType,
      uploadDate,
      applicationId
    FROM Document
    WHERE applicationId = ?
    ORDER BY documentId ASC
  `;

  db.all(query, [applicationId], (err, rows) => {
    if (err) {
      console.error("Document fetch error:", err.message);
      return res.status(500).json({ message: "Failed to fetch documents" });
    }

    res.json(rows);
  });
});

module.exports = router;