const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementViews,
} = require("../controllers/blogController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// ── BLOG ROUTES ────────────────────────────────────────────────
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.get("/slug/:slug", getBlogBySlug);
router.post("/", isAuthenticated, createBlog);
router.put("/:id", isAuthenticated, updateBlog);
router.delete("/:id", isAuthenticated, deleteBlog);
router.patch("/slug/:slug/view", incrementViews);

module.exports = router;
