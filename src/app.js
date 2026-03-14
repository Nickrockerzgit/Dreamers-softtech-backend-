// const express = require("express");
// const cors = require("cors");
// const session = require("express-session");
// const { PrismaClient } = require("@prisma/client");
// const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

// const blogRoutes = require("./routes/blogRoutes");
// const authRoutes = require("./routes/authRoutes");
// const portfolioRoutes = require("./routes/portfolioRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const statsRoutes = require("./routes/statsRoutes");

// const testimonialRoutes = require("./routes/testimonialRoutes");

// const { isAuthenticated } = require("./middleware/authMiddleware");

// const visitorRoutes = require("./routes/visitorRoutes");
// const proposalRoutes = require("./routes/proposalRoutes");

// const prisma = new PrismaClient();
// const app = express();

// // ── CORS ───────────────────────────────────────────────────────
// // credentials: true → allows cookies to be sent cross-origin
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://dreamers-softtech.vercel.app"],
//     credentials: true,
//   }),
// );

// app.use(express.json());

// const path = require("path");
// // Note: /uploads static serving removed; images are now served from Cloudinary

// // ── SESSION ────────────────────────────────────────────────────
// // express-session  → manages session lifecycle
// // PrismaSessionStore → stores sessions in MySQL instead of RAM
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "dreamers-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     store: new PrismaSessionStore(prisma, {
//       checkPeriod: 2 * 60 * 1000, // cleanup expired sessions every 2 min
//       dbRecordIdIsSessionId: true,
//       dbRecordIdFunction: undefined,
//     }),
//     cookie: {
//       cookie: {
//         httpOnly: true,
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         sameSite: "none",
//         secure: true,
//       },
//     },
//   }),
// );

// // ── ROUTES ─────────────────────────────────────────────────────
// app.use("/api/auth", authRoutes);

// // isAuthenticated → protects all blog routes
// app.use("/api/blogs", blogRoutes);

// app.use("/api/portfolio", portfolioRoutes);

// app.use("/api/dashboard", dashboardRoutes);

// app.use("/api/messages", messageRoutes);

// app.use("/api/stats", statsRoutes);

// app.use("/api/testimonials", testimonialRoutes);

// app.use("/api/visitors", visitorRoutes);
// app.use("/api/proposals", proposalRoutes);

// // ── BASE ROUTE ─────────────────────────────────────────────────
// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "Dreamers Server is running ✅",
//     endpoints: {
//       login: "POST   /api/auth/login",
//       logout: "POST   /api/auth/logout",
//       getMe: "GET    /api/auth/me",
//       addAdmin: "POST   /api/auth/add-admin",
//       getAllAdmins: "GET    /api/auth/admins",
//       deleteAdmin: "DELETE /api/auth/admins/:id",
//       getAllBlogs: "GET    /api/blogs",
//       getBlogById: "GET    /api/blogs/:id",
//       createBlog: "POST   /api/blogs",
//       updateBlog: "PUT    /api/blogs/:id",
//       deleteBlog: "DELETE /api/blogs/:id",
//     },
//   });
// });

// // ── 404 HANDLER ────────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`,
//   });
// });

// module.exports = app;

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
const visitorRoutes = require("./routes/visitorRoutes");
const proposalRoutes = require("./routes/proposalRoutes");

const { isAuthenticated } = require("./middleware/authMiddleware");

// ── Import your jobs ───────────────────────────────────────────
const { startDepositJob } = require("./jobs/depositJob");
const { startDepositMatcherJob } = require("./jobs/depositMatcherJob");
const { startRobotActivationJob } = require("./jobs/robotActivationJob");
const cronJobs = require("./jobs/cronJobs");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ───────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:5173", "https://dreamers-softtech.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

// ── SESSION ────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dreamers-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    },
  }),
);

// ── ROUTES ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/proposals", proposalRoutes);

// ── HEALTH CHECK ───────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy ✅" });
});

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

// ── SERVER STARTUP ─────────────────────────────────────────────
async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully (Prisma)");

    // Start background jobs
    startDepositJob();
    startDepositMatcherJob();
    startRobotActivationJob();
    cronJobs.init();

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║      Server is running on port ${PORT}        ║
║      http://localhost:${PORT}                 ║
║                                               ║
║   → API Base: http://localhost:${PORT}/api    ║
║   → Health:   http://localhost:${PORT}/health ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
