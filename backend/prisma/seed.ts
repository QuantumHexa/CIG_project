import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cig.dev" },
    update: {},
    create: {
      email: "admin@cig.dev",
      name: "Platform Admin",
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const photographer = await prisma.user.upsert({
    where: { email: "photo@cig.dev" },
    update: {},
    create: {
      email: "photo@cig.dev",
      name: "Event Photographer",
      role: Role.PHOTOGRAPHER,
      passwordHash,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@cig.dev" },
    update: {},
    create: {
      email: "member@cig.dev",
      name: "Club Member",
      role: Role.CLUB_MEMBER,
      passwordHash,
    },
  });

  const event = await prisma.event.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      name: "Annual Cultural Fest 2026",
      description: "Photos and videos from the main stage, workshops, and crowd.",
      date: new Date("2026-03-15"),
      category: "cultural",
      clubName: "CIG Cultural Club",
      isPublic: true,
      createdById: admin.id,
      albums: {
        create: [{ name: "Main Stage" }, { name: "Backstage" }],
      },
    },
    include: { albums: true },
  });

  console.log("Seed complete:");
  console.log("  admin@cig.dev / password123");
  console.log("  photo@cig.dev / password123");
  console.log("  member@cig.dev / password123");
  console.log("  Event:", event.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
