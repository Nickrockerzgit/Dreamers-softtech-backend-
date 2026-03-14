// src/routes/testimonialRoutes.js

const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../config/upload");

// single avatar image upload
const uploadAvatar = upload.single("avatarImage");

// ── PUBLIC ─────────────────────────────────────────────────────
router.get("/", testimonialController.getAllTestimonials);
router.get("/:id", testimonialController.getTestimonialById);

// ── PROTECTED ──────────────────────────────────────────────────
router.post(
  "/",
  isAuthenticated,
  uploadAvatar,
  testimonialController.createTestimonial,
);
router.put(
  "/:id",
  isAuthenticated,
  uploadAvatar,
  testimonialController.updateTestimonial,
);
router.delete("/:id", isAuthenticated, testimonialController.deleteTestimonial);

module.exports = router;
