// prisma/seedTestimonials.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const testimonials = [
  {
    name: "Rohit Verma",
    company: "TechStart Solutions",
    role: "CEO",
    avatar: "RV",
    color: "#C89A3D",
    avatarImage: null,
    rating: 5,
    text: "Dreamers Softtech delivered exceptional results. Their team understood our vision and transformed it into a powerful digital solution. Highly recommended!",
    status: "published",
  },
  {
    name: "Anjali Mehta",
    company: "E-Commerce Pro",
    role: "Founder",
    avatar: "AM",
    color: "#4F8EF7",
    avatarImage: null,
    rating: 5,
    text: "Outstanding work! They built our e-commerce platform from scratch and it exceeded all expectations. Professional, timely, and innovative.",
    status: "published",
  },
  {
    name: "Karan Desai",
    company: "HealthCare Plus",
    role: "Product Manager",
    avatar: "KD",
    color: "#2DBD8E",
    avatarImage: null,
    rating: 5,
    text: "The mobile app they developed has transformed our patient engagement. Their attention to detail and commitment to quality is unmatched.",
    status: "published",
  },
  {
    name: "Neha Kapoor",
    company: "FinTech Innovations",
    role: "CTO",
    avatar: "NK",
    color: "#E45C7C",
    avatarImage: null,
    rating: 5,
    text: "Working with Dreamers Softtech was a game-changer for us. Their technical expertise and problem-solving abilities are top-notch.",
    status: "published",
  },
  {
    name: "Siddharth Rao",
    company: "Digital Marketing Hub",
    role: "Director",
    avatar: "SR",
    color: "#9B6FE4",
    avatarImage: null,
    rating: 5,
    text: "They delivered our project on time and within budget. The team was responsive, skilled, and a pleasure to work with throughout.",
    status: "published",
  },
  {
    name: "Priya Singh",
    company: "CloudBase Inc.",
    role: "VP Engineering",
    avatar: "PS",
    color: "#F4922A",
    avatarImage: null,
    rating: 5,
    text: "Incredible attention to detail. The team went above and beyond to ensure every feature worked flawlessly. Truly a world-class development partner.",
    status: "published",
  },
  {
    name: "Amit Joshi",
    company: "RetailNow",
    role: "Co-Founder",
    avatar: "AJ",
    color: "#3ABDE0",
    avatarImage: null,
    rating: 5,
    text: "From ideation to launch, Dreamers Softtech guided us perfectly. The product quality speaks for itself — our users love every part of it.",
    status: "published",
  },
  {
    name: "Divya Nair",
    company: "EduTech Global",
    role: "Head of Product",
    avatar: "DN",
    color: "#C89A3D",
    avatarImage: null,
    rating: 5,
    text: "Super collaborative team! They listened carefully, iterated fast, and shipped a polished product ahead of schedule. 10/10 experience.",
    status: "published",
  },
  {
    name: "Vikram Bose",
    company: "LogiFlow",
    role: "CTO",
    avatar: "VB",
    color: "#E45C7C",
    avatarImage: null,
    rating: 5,
    text: "Their technical depth is impressive. Complex backend architecture delivered cleanly, on time, and exactly as scoped. Stellar work.",
    status: "published",
  },
  {
    name: "Meera Pillai",
    company: "GreenTech Labs",
    role: "CEO",
    avatar: "MP",
    color: "#2DBD8E",
    avatarImage: null,
    rating: 5,
    text: "We needed a partner who could move fast without breaking things. Dreamers Softtech nailed it every single sprint.",
    status: "published",
  },
];

async function main() {
  console.log("🌱 Seeding testimonials...");

  for (const t of testimonials) {
    // match by name + company so re-running won't duplicate
    const existing = await prisma.testimonial.findFirst({
      where: { name: t.name, company: t.company },
    });

    if (existing) {
      console.log(`  ⏭  Skipped (exists): ${t.name}`);
      continue;
    }

    await prisma.testimonial.create({ data: t });
    console.log(`  ✅ ${t.name} — ${t.company}`);
  }

  console.log("🎉 Testimonials seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
