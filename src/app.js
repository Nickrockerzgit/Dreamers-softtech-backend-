const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const messageRoutes = require("./routes/messageRoutes");
const statsRoutes = require("./routes/statsRoutes");

const testimonialRoutes = require("./routes/testimonialRoutes");

const { isAuthenticated } = require("./middleware/authMiddleware");

const visitorRoutes = require("./routes/visitorRoutes");
const proposalRoutes = require("./routes/proposalRoutes");

const prisma = new PrismaClient();
const app = express();

// ── CORS ───────────────────────────────────────────────────────
// credentials: true → allows cookies to be sent cross-origin
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://dreamers-softtech.vercel.app",
    credentials: true,
  }),
);

app.use(express.json());

const path = require("path");
// Note: /uploads static serving removed; images are now served from Cloudinary

// ── SESSION ────────────────────────────────────────────────────
// express-session  → manages session lifecycle
// PrismaSessionStore → stores sessions in MySQL instead of RAM
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dreamers-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // cleanup expired sessions every 2 min
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      httpOnly: true, // JS cannot access cookie → more secure
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax", // local development friendly
      secure: false, // false for localhost, true for production
    },
  }),
);

// ── ROUTES ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// isAuthenticated → protects all blog routes
app.use("/api/blogs", blogRoutes);

app.use("/api/portfolio", portfolioRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/stats", statsRoutes);

app.use("/api/testimonials", testimonialRoutes);

app.use("/api/visitors", visitorRoutes);
app.use("/api/proposals", proposalRoutes);

// ── BASE ROUTE ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dreamers Server is running ✅",
    endpoints: {
      login: "POST   /api/auth/login",
      logout: "POST   /api/auth/logout",
      getMe: "GET    /api/auth/me",
      addAdmin: "POST   /api/auth/add-admin",
      getAllAdmins: "GET    /api/auth/admins",
      deleteAdmin: "DELETE /api/auth/admins/:id",
      getAllBlogs: "GET    /api/blogs",
      getBlogById: "GET    /api/blogs/:id",
      createBlog: "POST   /api/blogs",
      updateBlog: "PUT    /api/blogs/:id",
      deleteBlog: "DELETE /api/blogs/:id",
    },
  });
});

// ── 404 HANDLER ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;
