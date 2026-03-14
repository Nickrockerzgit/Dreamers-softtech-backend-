// prisma/reseed.js  — full database reseed
// Covers: superadmin, portfolio projects (with Cloudinary), SiteStats

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── 1. SUPERADMIN ───────────────────────────────────────────────
async function seedAdmin() {
  console.log("\n👤 Seeding superadmin...");
  const email = "dreamerssoftcon@gmail.com";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log("   ✅ Superadmin already exists, skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash("12345678", 10);
  await prisma.admin.create({
    data: {
      name:          "Super Admin",
      email,
      password:      hashedPassword,
      role:          "superadmin",
      status:        "approved",
      emailVerified: true,
    },
  });
  console.log("   ✅ Superadmin created.");
}

// ── 2. PORTFOLIO ────────────────────────────────────────────────
const projects = [
  {
    title:      "E-commerce Platform",
    slug:       "e-commerce-platform",
    category:   "Web Development",
    overview:   "A comprehensive online shopping solution with advanced features, secure payments, and seamless UX.",
    description:"This e-commerce platform was built to provide businesses with a complete online shopping solution. It features secure payment gateways, product management, order tracking, and a seamless user experience across all devices.",
    techStack:  JSON.stringify(["React", "Node.js", "MongoDB", "Stripe", "Tailwind CSS"]),
    clientName: "Internal Project",
    clientInfo: "A showcase project demonstrating full-stack e-commerce capabilities.",
    keyFeatures:JSON.stringify(["Secure payment gateway integration","Product catalog with advanced filtering","Order tracking and management","Admin dashboard for inventory control","Mobile-responsive design"]),
    status:     "published",
  },
  {
    title:      "Healthcare App",
    slug:       "healthcare-app",
    category:   "Mobile Development",
    overview:   "Patient management and telemedicine platform built for reliability and compliance.",
    description:"A comprehensive healthcare application enabling patients to book appointments, consult doctors via video call, and manage their medical records securely. Built with HIPAA compliance in mind.",
    techStack:  JSON.stringify(["React Native", "Node.js", "PostgreSQL", "WebRTC", "AWS"]),
    clientName: "MedCare Clinic",
    clientInfo: "A growing healthcare provider looking to digitize patient management.",
    keyFeatures:JSON.stringify(["Video telemedicine consultations","Patient record management","Appointment booking system","Prescription management","HIPAA compliant data storage"]),
    status:     "published",
  },
  {
    title:      "Financial Dashboard",
    slug:       "financial-dashboard",
    category:   "Web Application",
    overview:   "Real-time analytics and reporting system with beautiful data visualizations.",
    description:"A powerful financial dashboard providing real-time insights into business performance. Features interactive charts, automated reports, and multi-currency support for global businesses.",
    techStack:  JSON.stringify(["React", "D3.js", "Express", "MySQL", "Redis"]),
    clientName: "FinTrack Solutions",
    clientInfo: "A fintech startup building tools for SME financial management.",
    keyFeatures:JSON.stringify(["Real-time financial analytics","Interactive data visualizations","Automated report generation","Multi-currency support","Export to PDF and Excel"]),
    status:     "published",
  },
  {
    title:      "Social Media Platform",
    slug:       "social-media-platform",
    category:   "Full Stack",
    overview:   "Community-driven content sharing application built to scale to millions.",
    description:"A full-featured social media platform with real-time feeds, messaging, content sharing, and community management tools. Designed for high scalability using microservices architecture.",
    techStack:  JSON.stringify(["Next.js", "GraphQL", "PostgreSQL", "Redis", "Socket.IO", "AWS S3"]),
    clientName: "Internal Project",
    clientInfo: "A scalability showcase demonstrating real-time social features.",
    keyFeatures:JSON.stringify(["Real-time news feed","Direct and group messaging","Media uploads and sharing","Community and group management","Content moderation tools"]),
    status:     "published",
  },
  {
    title:      "Educational Portal",
    slug:       "educational-portal",
    category:   "Web Development",
    overview:   "Online learning management system with live classes, quizzes, and progress tracking.",
    description:"A complete LMS platform enabling educators to create courses, host live sessions, and track student progress. Students can access content, take quizzes, and earn certificates on completion.",
    techStack:  JSON.stringify(["React", "Node.js", "MongoDB", "Socket.IO", "Zoom SDK", "Stripe"]),
    clientName: "EduTech Pvt Ltd",
    clientInfo: "An edtech startup focused on affordable online education.",
    keyFeatures:JSON.stringify(["Live class hosting with video","Course creation and management","Quiz and assessment engine","Student progress tracking","Certificate generation","Subscription billing"]),
    status:     "published",
  },
  {
    title:      "Food Delivery App",
    slug:       "food-delivery-app",
    category:   "Mobile Development",
    overview:   "On-demand food ordering and delivery solution with real-time tracking.",
    description:"A full-stack food delivery platform connecting restaurants, delivery partners, and customers. Features real-time order tracking, dynamic pricing, and a powerful restaurant management dashboard.",
    techStack:  JSON.stringify(["React Native", "Node.js", "MongoDB", "Socket.IO", "Google Maps API", "Razorpay"]),
    clientName: "QuickBite Pvt Ltd",
    clientInfo: "A food delivery startup operating in tier-2 Indian cities.",
    keyFeatures:JSON.stringify(["Real-time order tracking on map","Restaurant and menu management","Dynamic delivery fee calculation","Multi-payment gateway support","Delivery partner app","Ratings and reviews system"]),
    status:     "published",
  },
];

async function seedPortfolio() {
  console.log("\n📁 Seeding portfolio projects...");

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const localImagePath = path.join(__dirname, `../uploads/portfolio${i + 1}.png`);

    // Try to upload image to Cloudinary if local file exists
    let heroImage = null;
    let images    = JSON.stringify([]);

    if (fs.existsSync(localImagePath)) {
      try {
        const result = await cloudinary.uploader.upload(localImagePath, {
          folder:        "dreamers_portfolio",
          resource_type: "image",
        });
        heroImage = result.secure_url;
        images    = JSON.stringify([result.secure_url]);
        console.log(`   ☁️  Uploaded image for "${project.title}"`);
      } catch (err) {
        console.warn(`   ⚠️  Cloudinary upload failed for "${project.title}": ${err.message}`);
      }
    } else {
      console.warn(`   ⚠️  No local image at ${localImagePath}, skipping upload.`);
    }

    await prisma.portfolio.upsert({
      where:  { slug: project.slug },
      update: { ...project, heroImage, images },
      create: { ...project, heroImage, images },
    });
    console.log(`   ✅ "${project.title}" upserted.`);
  }
}

// ── 3. SITE STATS ───────────────────────────────────────────────
async function seedSiteStats() {
  console.log("\n📊 Seeding site stats...");
  await prisma.siteStats.upsert({
    where:  { id: 1 },
    update: {},  // don't overwrite if already customised
    create: {
      id:                1,
      projectsCompleted: 6,
      happyClients:      4,
      yearsExperience:   1,
      satisfactionRate:  98,
      teamMembersCount:  5,
      technologiesCount: 20,
    },
  });
  console.log("   ✅ SiteStats seeded (id=1).");
}

// ── MAIN ────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting full database reseed...");
  await seedAdmin();
  await seedPortfolio();
  await seedSiteStats();
  console.log("\n🎉 Reseed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
