const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ── GET ALL BLOGS ──────────────────────────────────────────────
const getAllBlogs = async () => {
  return await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// ── GET SINGLE BLOG ────────────────────────────────────────────
const getBlogById = async (id) => {
  return await prisma.blog.findUnique({
    where: { id },
  });
};

// ── GET BLOG BY SLUG ───────────────────────────────────────────
const getBlogBySlug = async (slug) => {
  return await prisma.blog.findUnique({
    where: { slug },
  });
};

// ── CREATE BLOG ────────────────────────────────────────────────
const createBlog = async (data) => {
  return await prisma.blog.create({
    data: {
      title: data.title,
      slug: data.slug,
      author: data.author,
      category: data.category,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage || null,
      status: data.status || "draft",
    },
  });
};

// ── UPDATE BLOG ────────────────────────────────────────────────
const updateBlog = async (id, data) => {
  return await prisma.blog.update({
    where: { id },
    data,
  });
};

// ── DELETE BLOG ────────────────────────────────────────────────
const deleteBlog = async (id) => {
  return await prisma.blog.delete({
    where: { id },
  });
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
};
