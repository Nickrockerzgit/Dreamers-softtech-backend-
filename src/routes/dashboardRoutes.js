// src/routes/dashboardRoutes.js

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// ── PROTECTED ROUTES (admin only) ─────────────────────────────
// Fetch dashboard statistics
router.get("/stats", isAuthenticated, dashboardController.getDashboardStats);

module.exports = router;
