// src/services/testimonialService.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ── GET ALL ────────────────────────────────────────────────────
const getAllTestimonials = async () => {
  return await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// ── GET BY ID ──────────────────────────────────────────────────
const getTestimonialById = async (id) => {
  return await prisma.testimonial.findUnique({ where: { id } });
};

// ── CREATE ─────────────────────────────────────────────────────
const createTestimonial = async (data) => {
  return await prisma.testimonial.create({
    data: {
      name: data.name,
      company: data.company,
      role: data.role,
      avatar: data.avatar || null,
      color: data.color || "#C89A3D",
      avatarImage: data.avatarImage || null,
      rating: data.rating ? parseInt(data.rating) : 5,
      text: data.text,
      status: data.status || "published",
    },
  });
};

// ── UPDATE ─────────────────────────────────────────────────────
const updateTestimonial = async (id, data) => {
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

  return await prisma.testimonial.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      company: data.company ?? existing.company,
      role: data.role ?? existing.role,
      avatar: data.avatar ?? existing.avatar,
      color: data.color ?? existing.color,
      avatarImage:
        data.avatarImage !== undefined
          ? data.avatarImage
          : existing.avatarImage,
      rating: data.rating ? parseInt(data.rating) : existing.rating,
      text: data.text ?? existing.text,
      status: data.status ?? existing.status,
    },
  });
};

// ── DELETE ─────────────────────────────────────────────────────
const deleteTestimonial = async (id) => {
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  return await prisma.testimonial.delete({ where: { id } });
};

module.exports = {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
