require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding superadmin...");

  const email = "dreamerssoftcon@gmail.com";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log("✅ Superadmin already exists, skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash("Rishabh@2005#", 10);

  await prisma.admin.create({
    data: {
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "superadmin",
      status: "approved",
      emailVerified: true,
    },
  });

  console.log("✅ Superadmin created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
