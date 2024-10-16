const express = require("express");
const router = express.Router();
const User = require("../models/userModel");


router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error });
  }
});

module.exports = router;
