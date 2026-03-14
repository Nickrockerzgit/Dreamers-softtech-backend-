// src/controllers/dashboardController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    // 1. Get total published blogs
    const totalBlogs = await prisma.blog.count({
      where: { status: "published" },
    });

    // 2. Get total views across all blogs
    const viewsAggregation = await prisma.blog.aggregate({
      _sum: { views: true },
    });
    const totalViews = viewsAggregation._sum.views || 0;

    // 3. Get total portfolio projects
    const totalProjects = await prisma.portfolio.count();

    // 4. Get total administrators
    const totalAdmins = await prisma.admin.count();

    // 5. Get recent activity (last 3 blogs and last 3 projects)
    const recentBlogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    const recentProjects = await prisma.portfolio.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalBlogs,
          totalViews,
          totalProjects,
          totalAdmins,
        },
        recentActivity: {
          blogs: recentBlogs,
          projects: recentProjects,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
