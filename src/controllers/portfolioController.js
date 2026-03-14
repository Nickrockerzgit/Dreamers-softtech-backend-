// src/controllers/portfolioController.js

const portfolioService = require("../services/PortfolioServices");
const path = require("path");

// Note: Removed fileUrl helper as Cloudinary automatically returns full URLs in req.files[].path

// ── GET ALL ────────────────────────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    let status = req.query.status;

    // If NOT logged in (visitor), strictly show only "published"
    if (!req.session || !req.session.adminId) {
      status = "published";
    } else {
      // If logged in (admin), "all" or specific status
      if (status === "all") status = undefined;
    }

    const projects = await portfolioService.getAllProjects(status);
    // parse JSON strings back to arrays before sending
    const parsed = projects.map(parseProject);
    res.status(200).json({ success: true, count: parsed.length, data: parsed });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get projects",
      error: error.message,
    });
  }
};

// ── GET BY SLUG ────────────────────────────────────────────────
const getProjectBySlug = async (req, res) => {
  try {
    const project = await portfolioService.getProjectBySlug(req.params.slug);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, data: parseProject(project) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get project",
      error: error.message,
    });
  }
};

// ── CREATE ─────────────────────────────────────────────────────
// expects multipart/form-data
// fields: title, category, overview, description, techStack (JSON string),
//         clientName, clientInfo, keyFeatures (JSON string), status
// files:  heroImage (single), images (multiple)
const createProject = async (req, res) => {
  try {
    const {
      title,
      category,
      overview,
      description,
      techStack,
      clientName,
      clientInfo,
      keyFeatures,
      status,
    } = req.body;

    if (!title || !category || !overview || !description || !clientName) {
      return res.status(400).json({
        success: false,
        message:
          "title, category, overview, description and clientName are required",
      });
    }

    // parse arrays sent as JSON strings from form
    const techStackArr = safeParse(techStack, []);
    const keyFeaturesArr = safeParse(keyFeatures, []);

    // hero image — single file under field "heroImage"
    const heroImage = req.files?.heroImage?.[0]
      ? req.files.heroImage[0].path
      : null;

    // gallery images — multiple files under field "images"
    const images = req.files?.images
      ? req.files.images.map((f) => f.path)
      : [];

    const project = await portfolioService.createProject({
      title,
      category,
      overview,
      description,
      techStack: techStackArr,
      clientName,
      clientInfo,
      keyFeatures: keyFeaturesArr,
      heroImage,
      images,
      status: status || "draft",
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: parseProject(project),
    });
  } catch (error) {
    const errorMap = {
      SLUG_EXISTS: {
        status: 409,
        message: "A project with this title already exists",
      },
    };
    const mapped = errorMap[error.message];
    if (mapped)
      return res
        .status(mapped.status)
        .json({ success: false, message: mapped.message });

    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// ── UPDATE ─────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const {
      title,
      category,
      overview,
      description,
      techStack,
      clientName,
      clientInfo,
      keyFeatures,
      status,
    } = req.body;

    const techStackArr = techStack ? safeParse(techStack, []) : undefined;
    const keyFeaturesArr = keyFeatures ? safeParse(keyFeatures, []) : undefined;

    // new hero image if uploaded
    const heroImage = req.files?.heroImage?.[0]
      ? req.files.heroImage[0].path
      : undefined;

    // new gallery images if uploaded — appended to existing on frontend
    const newImages = req.files?.images
      ? req.files.images.map((f) => f.path)
      : undefined;

    // if existingImages sent from frontend (kept ones), merge with new uploads
    let images = undefined;
    if (req.body.existingImages || newImages) {
      const existing = req.body.existingImages
        ? safeParse(req.body.existingImages, [])
        : [];
      images = [...existing, ...(newImages || [])];
    }

    const project = await portfolioService.updateProject(req.params.id, {
      title,
      category,
      overview,
      description,
      techStack: techStackArr,
      clientName,
      clientInfo,
      keyFeatures: keyFeaturesArr,
      heroImage,
      images,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: parseProject(project),
    });
  } catch (error) {
    const errorMap = {
      NOT_FOUND: { status: 404, message: "Project not found" },
      SLUG_EXISTS: {
        status: 409,
        message: "A project with this title already exists",
      },
    };
    const mapped = errorMap[error.message];
    if (mapped)
      return res
        .status(mapped.status)
        .json({ success: false, message: mapped.message });

    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// ── DELETE ─────────────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    await portfolioService.deleteProject(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    if (error.message === "NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// ── HELPERS ────────────────────────────────────────────────────

// parse JSON string fields back to arrays
const parseProject = (project) => ({
  ...project,
  techStack: safeParse(project.techStack, []),
  keyFeatures: safeParse(project.keyFeatures, []),
  images: safeParse(project.images, []),
});

const safeParse = (val, fallback) => {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

module.exports = {
  getAllProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
};
