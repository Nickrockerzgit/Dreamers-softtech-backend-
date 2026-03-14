const visitorService = require("../services/visitorService");

// ── POST /api/visitors/track ───────────────────────────────────
const trackVisit = async (req, res) => {
  try {
    await visitorService.trackVisit();
    res.status(200).json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error tracking visit",
        error: error.message,
      });
  }
};

// ── GET /api/visitors/monthly ──────────────────────────────────
const getMonthlyVisitors = async (req, res) => {
  try {
    const data = await visitorService.getMonthlyVisitors();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching visitor data",
        error: error.message,
      });
  }
};

module.exports = { trackVisit, getMonthlyVisitors };
