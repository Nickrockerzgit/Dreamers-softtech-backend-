const blogService = require("../services/blogService");

// ── GET ALL BLOGS ──────────────────────────────────────────────
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await blogService.getAllBlogs();
    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};

// ── GET SINGLE BLOG ────────────────────────────────────────────
const getBlogById = async (req, res) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};

// ── GET BLOG BY SLUG ───────────────────────────────────────────
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await blogService.getBlogBySlug(req.params.slug);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};

// ── CREATE BLOG ────────────────────────────────────────────────
const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      author,
      category,
      excerpt,
      content,
      coverImage,
      status,
    } = req.body;

    // validation
    if (!title || !slug || !author || !category || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: title, slug, author, category, excerpt, content",
      });
    }

    const blog = await blogService.createBlog(req.body);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    // duplicate slug error
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Slug already exists — use a different slug",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating blog",
      error: error.message,
    });
  }
};

// ── UPDATE BLOG ────────────────────────────────────────────────
const updateBlog = async (req, res) => {
  try {
    const existing = await blogService.getBlogById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const blog = await blogService.updateBlog(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};

// ── DELETE BLOG ────────────────────────────────────────────────
const deleteBlog = async (req, res) => {
  try {
    const existing = await blogService.getBlogById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    await blogService.deleteBlog(req.params.id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
};
