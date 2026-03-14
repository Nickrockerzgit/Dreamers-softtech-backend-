const express = require("express");
const router = express.Router();
const {
  trackVisit,
  getMonthlyVisitors,
} = require("../controllers/visitorController");

router.post("/track", trackVisit);
router.get("/monthly", getMonthlyVisitors);

module.exports = router;
