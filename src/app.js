const express = require("express");
const cors = require("cors");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ── ROUTES ─────────────────────────────────────────────────────
app.use("/api/blogs", blogRoutes);

// ── BASE ROUTE ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dreamers Server is running ",
    endpoints: {
      getAllBlogs: "GET    /api/blogs",
      getBlogById: "GET    /api/blogs/:id",
      getBlogBySlug: "GET    /api/blogs/slug/:slug",
      createBlog: "POST   /api/blogs",
      updateBlog: "PUT    /api/blogs/:id",
      deleteBlog: "DELETE /api/blogs/:id",
    },
  });
});

// ── 404 HANDLER ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;
