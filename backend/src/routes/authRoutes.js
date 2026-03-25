const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      message: "Email, password, and role are required"
    });
  }

  res.json({
    message: "Login successful",
    user: {
      userId: 1,
      name: "Alex Johnson",
      email: email,
      role: role
    }
  });
});

module.exports = router;