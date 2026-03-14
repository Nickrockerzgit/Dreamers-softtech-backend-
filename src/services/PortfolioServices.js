// src/services/portfolioService.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ── HELPERS ────────────────────────────────────────────────────
// auto-generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// ── GET ALL ────────────────────────────────────────────────────
const getAllProjects = async (status) => {
  const where = {};
  if (status) {
    where.status = status;
  }
  return await prisma.portfolio.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

// ── GET BY SLUG ────────────────────────────────────────────────
const getProjectBySlug = async (slug) => {
  return await prisma.portfolio.findUnique({
    where: { slug },
  });
};

// ── GET BY ID ──────────────────────────────────────────────────
const getProjectById = async (id) => {
  return await prisma.portfolio.findUnique({
    where: { id },
  });
};

// ── CREATE ─────────────────────────────────────────────────────
const createProject = async (data) => {
  const slug = generateSlug(data.title);

  // check slug not already taken
  const existing = await prisma.portfolio.findUnique({ where: { slug } });
  if (existing) throw new Error("SLUG_EXISTS");

  return await prisma.portfolio.create({
    data: {
      title: data.title,
      slug,
      category: data.category,
      overview: data.overview,
      description: data.description,
      techStack: JSON.stringify(data.techStack || []),
      clientName: data.clientName,
      clientInfo: data.clientInfo,
      keyFeatures: JSON.stringify(data.keyFeatures || []),
      heroImage: data.heroImage || null,
      images: JSON.stringify(data.images || []),
      status: data.status || "draft",
    },
  });
};

// ── UPDATE ─────────────────────────────────────────────────────
const updateProject = async (id, data) => {
  const project = await prisma.portfolio.findUnique({ where: { id } });
  if (!project) throw new Error("NOT_FOUND");

  // regenerate slug only if title changed
  let slug = project.slug;
  if (data.title && data.title !== project.title) {
    slug = generateSlug(data.title);
    // check new slug not taken by another project
    const existing = await prisma.portfolio.findUnique({ where: { slug } });
    if (existing && existing.id !== id) throw new Error("SLUG_EXISTS");
  }

  return await prisma.portfolio.update({
    where: { id },
    data: {
      title: data.title ?? project.title,
      slug,
      category: data.category ?? project.category,
      overview: data.overview ?? project.overview,
      description: data.description ?? project.description,
      techStack: data.techStack
        ? JSON.stringify(data.techStack)
        : project.techStack,
      clientName: data.clientName ?? project.clientName,
      clientInfo: data.clientInfo ?? project.clientInfo,
      keyFeatures: data.keyFeatures
        ? JSON.stringify(data.keyFeatures)
        : project.keyFeatures,
      heroImage: data.heroImage ?? project.heroImage,
      images: data.images ? JSON.stringify(data.images) : project.images,
      status: data.status ?? project.status,
    },
  });
};

// ── DELETE ─────────────────────────────────────────────────────
const deleteProject = async (id) => {
  const project = await prisma.portfolio.findUnique({ where: { id } });
  if (!project) throw new Error("NOT_FOUND");
  return await prisma.portfolio.delete({ where: { id } });
};

module.exports = {
  getAllProjects,
  getProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
