const blogService = require("../services/blogService");

// ── GET ALL BLOGS ──────────────────────────────────────────────
const getAllBlogs = async (req, res) => {
  try {
    let status = req.query.status;

    // If NOT logged in (visitor), strictly show only "published"
    if (!req.session || !req.session.adminId) {
      status = "published";
    } else {
      // If logged in (admin), "all" means no status filter
      if (status === "all") status = undefined;
    }

    const blogs = await blogService.getAllBlogs(status);
    const parsed = blogs.map(parseBlog);
    res.status(200).json({
      success: true,
      count: parsed.length,
      data: parsed,
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
      data: parseBlog(blog),
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
      data: parseBlog(blog),
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
      data: parseBlog(blog),
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
      data: parseBlog(blog),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};

// ── INCREMENT VIEWS ────────────────────────────────────────────
const incrementViews = async (req, res) => {
  try {
    const blog = await blogService.getBlogBySlug(req.params.slug);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    const updated = await blogService.incrementViews(req.params.slug);
    res.status(200).json({ success: true, views: updated.views });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating views",
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

// ── HELPERS ────────────────────────────────────────────────────
const parseBlog = (blog) => {
  if (!blog) return blog;
  let parsedTags = [];
  try {
    parsedTags = blog.tags ? JSON.parse(blog.tags) : [];
  } catch {
    parsedTags = [];
  }
  return {
    ...blog,
    tags: parsedTags,
  };
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementViews,
};
