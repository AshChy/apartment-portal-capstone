const express = require("express");
const router = express.Router();

router.post("/maintenance-request", (req, res) => {
  const { title, description, userId, unitId } = req.body;

  if (!title || !userId || !unitId) {
    return res.status(400).json({
      message: "Title, userId, and unitId are required"
    });
  }

  res.status(201).json({
    message: "Maintenance request submitted successfully",
    request: {
      requestId: 1,
      title,
      description: description || "",
      requestDate: "2026-03-25",
      status: "Submitted",
      userId,
      unitId
    }
  });
});

module.exports = router;