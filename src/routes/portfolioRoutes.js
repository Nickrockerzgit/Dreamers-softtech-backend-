// src/routes/portfolioRoutes.js

const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../config/upload");

// multer fields config — heroImage (1) + images (many)
const uploadFields = upload.fields([
  { name: "heroImage", maxCount: 1 },
  { name: "images", maxCount: 20 },
]);

// ── PUBLIC ROUTES ──────────────────────────────────────────────
router.get("/", portfolioController.getAllProjects);
router.get("/:slug", portfolioController.getProjectBySlug);

// ── PROTECTED ROUTES (admin only) ─────────────────────────────
router.post(
  "/",
  isAuthenticated,
  uploadFields,
  portfolioController.createProject,
);
router.put(
  "/:id",
  isAuthenticated,
  uploadFields,
  portfolioController.updateProject,
);
router.delete("/:id", isAuthenticated, portfolioController.deleteProject);

module.exports = router;
