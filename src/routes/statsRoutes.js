const express = require("express");
const router = express.Router();
const {
  getStats,
  updateStats,
  syncProjects,
} = require("../controllers/statsController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/", getStats);
router.put("/", isAuthenticated, updateStats);
router.patch("/sync-projects", isAuthenticated, syncProjects); // 👈 new

module.exports = router;
