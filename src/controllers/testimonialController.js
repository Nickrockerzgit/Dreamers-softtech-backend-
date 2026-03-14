// src/controllers/testimonialController.js

const testimonialService = require("../services/testimonialService");

const fileUrl = (filename) => `http://localhost:5000/uploads/${filename}`;

// ── GET ALL ────────────────────────────────────────────────────
const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await testimonialService.getAllTestimonials();
    res
      .status(200)
      .json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to get testimonials",
        error: error.message,
      });
  }
};

// ── GET BY ID ──────────────────────────────────────────────────
const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await testimonialService.getTestimonialById(
      req.params.id,
    );
    if (!testimonial)
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to get testimonial",
        error: error.message,
      });
  }
};

// ── CREATE ─────────────────────────────────────────────────────
const createTestimonial = async (req, res) => {
  try {
    const { name, company, role, avatar, color, rating, text, status } =
      req.body;

    if (!name || !company || !role || !text) {
      return res.status(400).json({
        success: false,
        message: "name, company, role and text are required",
      });
    }

    // avatar image — single file under field "avatarImage"
    const avatarImage = req.file ? fileUrl(req.file.filename) : null;

    const testimonial = await testimonialService.createTestimonial({
      name,
      company,
      role,
      avatar,
      color,
      avatarImage,
      rating,
      text,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: testimonial,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create testimonial",
        error: error.message,
      });
  }
};

// ── UPDATE ─────────────────────────────────────────────────────
const updateTestimonial = async (req, res) => {
  try {
    const {
      name,
      company,
      role,
      avatar,
      color,
      rating,
      text,
      status,
      removeAvatar,
    } = req.body;

    // new avatar image uploaded
    let avatarImage = undefined;
    if (req.file) {
      avatarImage = fileUrl(req.file.filename);
    } else if (removeAvatar === "true") {
      avatarImage = null; // explicitly remove existing avatar
    }

    const testimonial = await testimonialService.updateTestimonial(
      req.params.id,
      {
        name,
        company,
        role,
        avatar,
        color,
        avatarImage,
        rating,
        text,
        status,
      },
    );

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: testimonial,
    });
  } catch (error) {
    if (error.message === "NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update testimonial",
        error: error.message,
      });
  }
};

// ── DELETE ─────────────────────────────────────────────────────
const deleteTestimonial = async (req, res) => {
  try {
    await testimonialService.deleteTestimonial(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    if (error.message === "NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete testimonial",
        error: error.message,
      });
  }
};

module.exports = {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
