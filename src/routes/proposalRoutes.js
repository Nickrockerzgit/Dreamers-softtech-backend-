// src/routes/proposalRoutes.js

const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposalController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// ── PUBLIC ROUTES (For Client) ─────────────────────────────────
router.post("/", proposalController.createProposal);
router.get("/verify/:token", proposalController.verifyProposalToken);
router.post("/confirm/:token", proposalController.confirmProposal);
router.post("/reject/:token", proposalController.rejectProposal);

// ── ADMIN ROUTES (Protected) ───────────────────────────────────
router.get("/", isAuthenticated, proposalController.getAllProposals);
router.put("/:id/status", isAuthenticated, proposalController.updateProposalStatus);
router.delete("/:id", isAuthenticated, proposalController.deleteProposal);

module.exports = router;
