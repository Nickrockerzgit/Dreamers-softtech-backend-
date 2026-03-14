// seed.js → runs once to create the default superadmin
// bcrypt → hashes the password before storing in DB

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seed() {
  try {
    // Check if superadmin already exists
    const existing = await prisma.admin.findUnique({
      where: { email: "dreamerssoftcon@gmail.com" },
    });

    if (existing) {
      console.log("Superadmin already exists ✅");
      return;
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash("Rishabh@2005", 10);

    await prisma.admin.create({
      data: {
        name: "Super Admin", // ← ADD
        email,
        password: hashed,
        role: "superadmin",
        status: "approved", // ← ADD
        emailVerified: true,
      },
    });

    console.log("Superadmin created successfully ✅");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

// seed.js → updates or creates the superadmin
// const { PrismaClient } = require("@prisma/client");
// const bcrypt = require("bcrypt");

// const prisma = new PrismaClient();

// async function seed() {
//   try {
//     const email = "dreamerssoftcon@gmail.com";

//     // 🔹 change this to whatever simple password you want
//     const newPassword = "12345678";

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     const existing = await prisma.admin.findUnique({
//       where: { email },
//     });

//     if (existing) {
//       // Update password if user already exists
//       await prisma.admin.update({
//         where: { email },
//         data: { password: hashedPassword },
//       });

//       console.log("Superadmin password updated ✅");
//     } else {
//       // Create user if not exists
//       await prisma.admin.create({
//         data: {
//           email,
//           password: hashedPassword,
//           role: "superadmin",
//         },
//       });

//       console.log("Superadmin created successfully ✅");
//     }
//   } catch (error) {
//     console.error("Seed error:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// seed();
