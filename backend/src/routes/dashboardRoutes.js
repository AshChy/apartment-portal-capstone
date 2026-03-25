const express = require("express");
const router = express.Router();

router.get("/tenant-dashboard", (req, res) => {
  res.json({
    tenant: {
      userId: 1,
      name: "Alex Johnson",
      role: "resident"
    },
    rentStatus: {
      amountDue: 1250.00,
      dueDate: "2026-04-06"
    },
    utilities: {
      amountDue: 85.20,
      dueDate: "2026-04-10"
    }
  });
});

module.exports = router;