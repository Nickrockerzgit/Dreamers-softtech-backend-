// src/routes/messageRoutes.js

const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// ── PUBLIC ROUTES ──────────────────────────────────────────────
// Send a message from the contact form
router.post("/", messageController.createMessage);

// ── PROTECTED ROUTES (admin only) ─────────────────────────────
// Get unread count (Must be before /:id routes!)
router.get("/unread-count", isAuthenticated, messageController.getUnreadCount);

// Get all messages for the dashboard
router.get("/", isAuthenticated, messageController.getMessages);

// Update message status (read/unread)
router.put("/:id/status", isAuthenticated, messageController.updateMessageStatus);

// Delete a message
router.delete("/:id", isAuthenticated, messageController.deleteMessage);

module.exports = router;
