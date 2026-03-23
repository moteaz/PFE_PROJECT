import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

type UserRole = "CLIENT" | "ADMIN";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Password123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@ar-bati.com" },
    update: {},
    create: {
      email: "admin@ar-bati.com",
      passwordHash: hash,
      firstName: "admin",
      lastName: "admin",
      phone: "+213550000001",
      role: "ADMIN",
    },
  });


  console.log("✅ Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
