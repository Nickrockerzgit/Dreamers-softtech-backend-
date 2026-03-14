const express = require("express");
const router = express.Router();
const {
  login,
  verifyOTP,
  verify2FA,
  logout,
  getMe,
  setup2FA,
  enable2FA,
  disable2FA,
  addAdmin,
  getAllAdmins,
  deleteAdmin,
  signup,
  verifySignupOTP,
  getPendingRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/authController");
const {
  isAuthenticated,
  isSuperAdmin,
} = require("../middleware/authMiddleware");

// ── PUBLIC ROUTES ──────────────────────────────────────────────
// no middleware → anyone can hit these
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/verify-2fa", verify2FA);

// ── SIGNUP ROUTES (PUBLIC) ─────────────────────────────────────
router.post("/signup", signup);
router.post("/signup/verify-otp", verifySignupOTP);

// ── ADMIN REQUEST ROUTES (SUPERADMIN ONLY) ─────────────────────
router.get("/requests", isAuthenticated, isSuperAdmin, getPendingRequests);
router.put(
  "/requests/:id/approve",
  isAuthenticated,
  isSuperAdmin,
  approveRequest,
);
router.put(
  "/requests/:id/reject",
  isAuthenticated,
  isSuperAdmin,
  rejectRequest,
);

// ── PROTECTED ROUTES ───────────────────────────────────────────
router.post("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getMe);

// ── 2FA ROUTES ─────────────────────────────────────────────────
router.post("/2fa/setup", isAuthenticated, setup2FA);
router.post("/2fa/enable", isAuthenticated, enable2FA);
router.post("/2fa/disable", isAuthenticated, disable2FA);

// ── SUPERADMIN ONLY ────────────────────────────────────────────
router.post("/add-admin", isAuthenticated, isSuperAdmin, addAdmin);
router.get("/admins", isAuthenticated, isSuperAdmin, getAllAdmins);
router.delete("/admins/:id", isAuthenticated, isSuperAdmin, deleteAdmin);

module.exports = router;
