const authService = require("../services/authService");

// ── IS AUTHENTICATED ───────────────────────────────────────────
// express-session → reads session cookie from request
// checks if session has adminId stored in it
const isAuthenticated = async (req, res, next) => {
  try {
    // check if session exists
    if (!req.session || !req.session.adminId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated — please login",
      });
    }

    // verify admin still exists in DB
    const admin = await authService.findAdminById(req.session.adminId);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found — please login again",
      });
    }

    // attach admin to request object
    // now any route can access req.admin
    req.admin = admin;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

// ── IS SUPER ADMIN ─────────────────────────────────────────────
// runs AFTER isAuthenticated
// checks if logged in admin has superadmin role
const isSuperAdmin = (req, res, next) => {
  if (req.admin.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Access denied — superadmin only",
    });
  }
  next();
};

module.exports = {
  isAuthenticated,
  isSuperAdmin,
};
