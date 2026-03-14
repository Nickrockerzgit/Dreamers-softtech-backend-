const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const prisma = new PrismaClient();

// ── FIND ADMIN BY EMAIL ────────────────────────────────────────
const findAdminByEmail = async (email) => {
  return await prisma.admin.findUnique({
    where: { email },
  });
};

// ── FIND ADMIN BY ID ───────────────────────────────────────────
const findAdminById = async (id) => {
  return await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      createdAt: true,
      // password excluded ✅
    },
  });
};

// ── VERIFY PASSWORD ────────────────────────────────────────────
// bcrypt → compares plain password with hashed password in DB
const verifyPassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

// ── HASH PASSWORD ──────────────────────────────────────────────
const hashPassword = async (plain) => {
  return await bcrypt.hash(plain, 10);
};

// ── CREATE ADMIN ───────────────────────────────────────────────
const createAdmin = async (email, password, role = "admin") => {
  const hashed = await hashPassword(password);
  return await prisma.admin.create({
    data: { email, password: hashed, role },
  });
};

// ── GET ALL ADMINS ─────────────────────────────────────────────
const getAllAdmins = async () => {
  return await prisma.admin.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// ── DELETE ADMIN ───────────────────────────────────────────────
const deleteAdmin = async (id) => {
  return await prisma.admin.delete({
    where: { id },
  });
};

// ── GENERATE AND SAVE OTP ──────────────────────────────────────
// generates 6 digit OTP → saves in DB with 5 min expiry
const generateAndSaveOTP = async (adminId) => {
  // generate 6 digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // expires in 5 minutes
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.admin.update({
    where: { id: adminId },
    data: { otpCode, otpExpiresAt },
  });

  return otpCode;
};

// ── VERIFY OTP ─────────────────────────────────────────────────
// checks OTP code and expiry
const verifyOTP = async (adminId, otpCode) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
  });

  if (!admin.otpCode || !admin.otpExpiresAt) {
    return { valid: false, message: "OTP not found" };
  }

  // check expiry
  if (new Date() > admin.otpExpiresAt) {
    return { valid: false, message: "OTP expired" };
  }

  // check code
  if (admin.otpCode !== otpCode) {
    return { valid: false, message: "Invalid OTP" };
  }

  // clear OTP after successful verification
  await prisma.admin.update({
    where: { id: adminId },
    data: { otpCode: null, otpExpiresAt: null },
  });

  return { valid: true };
};

// ── GENERATE 2FA SECRET ────────────────────────────────────────
// speakeasy → generates a secret key for Google Authenticator
const generate2FASecret = async (adminEmail) => {
  const secret = speakeasy.generateSecret({
    name: `Dreamers Softtech (${adminEmail})`,
  });

  // qrcode → converts secret into scannable QR image (base64)
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32, // save this in DB
    qrCode: qrCodeUrl, // show this to admin
  };
};

// ── SAVE 2FA SECRET ────────────────────────────────────────────
const save2FASecret = async (adminId, secret) => {
  await prisma.admin.update({
    where: { id: adminId },
    data: { twoFactorSecret: secret },
  });
};

// ── ENABLE 2FA ─────────────────────────────────────────────────
const enable2FA = async (adminId) => {
  await prisma.admin.update({
    where: { id: adminId },
    data: { twoFactorEnabled: true },
  });
};

// ── DISABLE 2FA ────────────────────────────────────────────────
const disable2FA = async (adminId) => {
  await prisma.admin.update({
    where: { id: adminId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });
};

// ── VERIFY 2FA CODE ────────────────────────────────────────────
// speakeasy → verifies 6 digit code from Google Authenticator
const verify2FACode = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // allows 30 sec clock drift
  });
};

// ── SIGNUP REQUEST ─────────────────────────────────────────────
const signupRequest = async (name, email, password) => {
  const existing = await prisma.admin.findUnique({ where: { email } });

  if (existing) {
    if (existing.emailVerified && existing.status === "pending") {
      throw new Error("REQUEST_PENDING");
    }
    if (existing.status === "approved") {
      throw new Error("ALREADY_APPROVED");
    }
    if (existing.status === "rejected") {
      throw new Error("REQUEST_REJECTED");
    }
    // email not verified yet → resend OTP
    if (!existing.emailVerified) {
      const hashed = await bcrypt.hash(password, 10);
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await prisma.admin.update({
        where: { email },
        data: { name, password: hashed, otpCode, otpExpiresAt },
      });
      return { otpCode };
    }
  }

  const hashed = await bcrypt.hash(password, 10);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.admin.create({
    data: {
      name,
      email,
      password: hashed,
      role: "admin",
      status: "pending",
      emailVerified: false,
      otpCode,
      otpExpiresAt,
    },
  });

  return { otpCode };
};

// ── VERIFY SIGNUP OTP ──────────────────────────────────────────
const verifySignupOTP = async (email, otpCode) => {
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) throw new Error("USER_NOT_FOUND");
  if (admin.emailVerified) throw new Error("ALREADY_VERIFIED");
  if (!admin.otpCode || !admin.otpExpiresAt) throw new Error("NO_OTP_FOUND");
  if (new Date() > admin.otpExpiresAt) throw new Error("OTP_EXPIRED");
  if (admin.otpCode !== otpCode) throw new Error("INVALID_OTP");

  await prisma.admin.update({
    where: { email },
    data: { emailVerified: true, otpCode: null, otpExpiresAt: null },
  });
};

// ── GET PENDING REQUESTS ───────────────────────────────────────
const getPendingRequests = async () => {
  return await prisma.admin.findMany({
    where: { status: "pending", emailVerified: true },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
};

// ── APPROVE REQUEST ────────────────────────────────────────────
const approveRequest = async (id) => {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new Error("USER_NOT_FOUND");
  if (admin.status === "approved") throw new Error("ALREADY_APPROVED");
  return await prisma.admin.update({
    where: { id },
    data: { status: "approved" },
  });
};

// ── REJECT REQUEST ─────────────────────────────────────────────
const rejectRequest = async (id) => {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new Error("USER_NOT_FOUND");
  return await prisma.admin.update({
    where: { id },
    data: { status: "rejected" },
  });
};

module.exports = {
  findAdminByEmail,
  findAdminById,
  verifyPassword,
  hashPassword,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  generateAndSaveOTP,
  verifyOTP,
  generate2FASecret,
  save2FASecret,
  enable2FA,
  disable2FA,
  verify2FACode,
  signupRequest,
  verifySignupOTP,
  getPendingRequests,
  approveRequest,
  rejectRequest,
};
