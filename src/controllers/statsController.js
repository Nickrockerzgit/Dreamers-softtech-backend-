const statsService = require("../services/statsService");

// GET /api/stats  (public)
const getStats = async (req, res) => {
  try {
    const stats = await statsService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch site stats" });
  }
};

// PUT /api/stats  (protected)
const updateStats = async (req, res) => {
  try {
    const stats = await statsService.updateStats(req.body);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Update Stats Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update site stats" });
  }
};

// PATCH /api/stats/sync-projects  (protected)
const syncProjects = async (req, res) => {
  try {
    const stats = await statsService.syncProjectsCount();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Sync Projects Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to sync project count" });
  }
};

module.exports = { getStats, updateStats, syncProjects };
