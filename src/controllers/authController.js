const authService = require("../services/authService");
const {
  sendOTPEmail,
  sendApprovalEmail,
  sendRejectionEmail,
} = require("../config/mailer");

// ── LOGIN ──────────────────────────────────────────────────────
// Step 1 of login → verify email + password → send OTP to email
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // find admin
    const admin = await authService.findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // verify password
    const isMatch = await authService.verifyPassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ── NEW: check approval status ─────────────────────────────
    if (admin.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your request is pending approval from the superadmin",
      });
    }
    if (admin.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your access request was rejected — contact the administrator",
      });
    }
    // ──────────────────────────────────────────────────────────

    // ── 2FA BYPASS: If 2FA is enabled, skip the Email OTP step ────────
    if (admin.twoFactorEnabled) {
      // Still need to store temp admin ID for the verify2FA step
      req.session.tempAdminId = admin.id;

      return res.status(200).json({
        success: true,
        message: "Enter your authenticator code",
        data: {
          email: admin.email,
          twoFactorEnabled: true,
        },
      });
    }
    // ──────────────────────────────────────────────────────────────────

    // generate OTP → save in DB → send to email (ONLY IF NO 2FA)
    const otpCode = await authService.generateAndSaveOTP(admin.id);
    await sendOTPEmail(admin.email, otpCode, "login"); // ← added "login" context

    // store adminId in session temporarily
    req.session.tempAdminId = admin.id;

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      data: {
        email: admin.email,
        twoFactorEnabled: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ── VERIFY OTP ─────────────────────────────────────────────────
// Step 2 of login → verify email OTP
// if 2FA enabled → ask for authenticator code
// if 2FA disabled → create session → logged in
const verifyOTP = async (req, res) => {
  try {
    const { otpCode } = req.body;

    // check if tempAdminId exists in session
    if (!req.session.tempAdminId) {
      return res.status(401).json({
        success: false,
        message: "Session expired — please login again",
      });
    }

    const adminId = req.session.tempAdminId;

    // verify OTP
    const result = await authService.verifyOTP(adminId, otpCode);
    if (!result.valid) {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    // get admin details
    const admin = await authService.findAdminById(adminId);

    // if 2FA enabled → need authenticator code next
    if (admin.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        message: "OTP verified — enter your authenticator code",
      });
    }

    // 2FA disabled → create full session → logged in ✅
    req.session.tempAdminId = null;
    req.session.adminId = admin.id;
    req.session.role = admin.role;
    req.session.email = admin.email;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

// ── VERIFY 2FA CODE ────────────────────────────────────────────
// Step 3 of login (only if 2FA enabled)
// verifies Google Authenticator code → creates session → logged in
const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    if (!req.session.tempAdminId) {
      return res.status(401).json({
        success: false,
        message: "Session expired — please login again",
      });
    }

    const adminId = req.session.tempAdminId;

    // get admin with secret
    const admin = await authService.findAdminByEmail(
      (await authService.findAdminById(adminId)).email,
    );

    // speakeasy → verify authenticator code
    const isValid = authService.verify2FACode(admin.twoFactorSecret, token);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticator code",
      });
    }

    // create full session → logged in ✅
    req.session.tempAdminId = null;
    req.session.adminId = admin.id;
    req.session.role = admin.role;
    req.session.email = admin.email;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "2FA verification failed",
      error: error.message,
    });
  }
};

// ── LOGOUT ─────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Logout failed",
        });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// ── GET ME ─────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const admin = await authService.findAdminById(req.session.adminId);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }
    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get admin info",
      error: error.message,
    });
  }
};

// ── SETUP 2FA ──────────────────────────────────────────────────
// generates secret + QR code for Google Authenticator setup
const setup2FA = async (req, res) => {
  try {
    const admin = await authService.findAdminById(req.session.adminId);

    // speakeasy → generate secret + qrcode → generate QR image
    const { secret, qrCode } = await authService.generate2FASecret(admin.email);

    // save secret in DB (not enabled yet)
    await authService.save2FASecret(admin.id, secret);

    res.status(200).json({
      success: true,
      message: "Scan QR code with Google Authenticator",
      data: {
        qrCode, // base64 image → show on frontend
        secret, // backup key
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "2FA setup failed",
      error: error.message,
    });
  }
};

// ── ENABLE 2FA ─────────────────────────────────────────────────
// verifies first authenticator code → enables 2FA
const enable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const admin = await authService.findAdminByEmail(
      (await authService.findAdminById(req.session.adminId)).email,
    );

    const isValid = authService.verify2FACode(admin.twoFactorSecret, token);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid code — please scan QR again",
      });
    }

    await authService.enable2FA(admin.id);

    res.status(200).json({
      success: true,
      message: "2FA enabled successfully ✅",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to enable 2FA",
      error: error.message,
    });
  }
};

// ── DISABLE 2FA ────────────────────────────────────────────────
const disable2FA = async (req, res) => {
  try {
    await authService.disable2FA(req.session.adminId);
    res.status(200).json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to disable 2FA",
      error: error.message,
    });
  }
};

// ── ADD ADMIN ──────────────────────────────────────────────────
const addAdmin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existing = await authService.findAdminByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    const admin = await authService.createAdmin(
      email,
      password,
      role || "admin",
    );

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: error.message,
    });
  }
};

// ── GET ALL ADMINS ─────────────────────────────────────────────
const getAllAdmins = async (req, res) => {
  try {
    const admins = await authService.getAllAdmins();
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get admins",
      error: error.message,
    });
  }
};

// ── DELETE ADMIN ───────────────────────────────────────────────
const deleteAdmin = async (req, res) => {
  try {
    if (req.params.id === req.session.adminId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete yourself",
      });
    }
    await authService.deleteAdmin(req.params.id);
    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete admin",
      error: error.message,
    });
  }
};

// ── SIGNUP ─────────────────────────────────────────────────────
// Step 1 → save pending request + send OTP to email
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const { otpCode } = await authService.signupRequest(name, email, password);
    await sendOTPEmail(email, otpCode, "signup");

    res.status(200).json({
      success: true,
      message: "OTP sent to your email — please verify",
    });
  } catch (error) {
    const errorMap = {
      REQUEST_PENDING: {
        status: 409,
        message: "Your request is already submitted and awaiting approval",
      },
      ALREADY_APPROVED: {
        status: 409,
        message: "This email is already registered as an admin",
      },
      REQUEST_REJECTED: {
        status: 403,
        message: "Your request was rejected — contact the administrator",
      },
    };
    const mapped = errorMap[error.message];
    if (mapped)
      return res
        .status(mapped.status)
        .json({ success: false, message: mapped.message });

    res
      .status(500)
      .json({ success: false, message: "Signup failed", error: error.message });
  }
};

// ── VERIFY SIGNUP OTP ──────────────────────────────────────────
// Step 2 → verify OTP → request becomes visible to superadmin
const verifySignupOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    await authService.verifySignupOTP(email, otpCode);

    res.status(200).json({
      success: true,
      message: "Email verified — your request has been submitted for approval",
    });
  } catch (error) {
    const errorMap = {
      USER_NOT_FOUND: {
        status: 404,
        message: "No signup request found for this email",
      },
      ALREADY_VERIFIED: { status: 409, message: "Email is already verified" },
      NO_OTP_FOUND: {
        status: 400,
        message: "No OTP found — please signup again",
      },
      OTP_EXPIRED: {
        status: 400,
        message: "OTP has expired — please signup again",
      },
      INVALID_OTP: { status: 400, message: "Invalid OTP — please try again" },
    };
    const mapped = errorMap[error.message];
    if (mapped)
      return res
        .status(mapped.status)
        .json({ success: false, message: mapped.message });

    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

// ── GET PENDING REQUESTS ───────────────────────────────────────
const getPendingRequests = async (req, res) => {
  try {
    const requests = await authService.getPendingRequests();
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get requests",
      error: error.message,
    });
  }
};

// ── APPROVE REQUEST ────────────────────────────────────────────
const approveRequest = async (req, res) => {
  try {
    const admin = await authService.approveRequest(req.params.id);
    await sendApprovalEmail(admin.email, admin.name || "Admin");

    res.status(200).json({
      success: true,
      message: "Admin approved successfully",
    });
  } catch (error) {
    const errorMap = {
      USER_NOT_FOUND: { status: 404, message: "Request not found" },
      ALREADY_APPROVED: { status: 409, message: "Admin is already approved" },
    };
    const mapped = errorMap[error.message];
    if (mapped)
      return res
        .status(mapped.status)
        .json({ success: false, message: mapped.message });

    res.status(500).json({
      success: false,
      message: "Failed to approve request",
      error: error.message,
    });
  }
};

// ── REJECT REQUEST ─────────────────────────────────────────────
const rejectRequest = async (req, res) => {
  try {
    const admin = await authService.rejectRequest(req.params.id);
    await sendRejectionEmail(admin.email, admin.name || "Admin");

    res.status(200).json({
      success: true,
      message: "Request rejected",
    });
  } catch (error) {
    const errorMap = {
      USER_NOT_FOUND: { status: 404, message: "Request not found" },
    };
    const mapped = errorMap[error.message];
    if (mapped)
      return res
        .status(mapped.status)
        .json({ success: false, message: mapped.message });

    res.status(500).json({
      success: false,
      message: "Failed to reject request",
      error: error.message,
    });
  }
};

module.exports = {
  login,
  verifyOTP,
  verify2FA,
  logout,
  getMe,
  setup2FA,
  enable2FA,
  disable2FA,
  addAdmin,
  getAllAdmins,
  deleteAdmin,
  signup,
  verifySignupOTP,
  getPendingRequests,
  approveRequest,
  rejectRequest,
};
