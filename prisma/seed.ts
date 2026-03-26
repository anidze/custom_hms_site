import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Add it to .env before running seed.`);
  }
  return value;
}

async function main() {
  console.log("🌱 Seed-ის დაწყება...");

  // 3 სატესტო სასტუმრო
  const hotel1 = await prisma.hotel.create({
    data: {
      name: "Eldream Tower",
      address: "თბილისი, რუსთაველის გამზ. 12",
      phone: "+995 32 200 00 01",
    },
  });

  const hotel2 = await prisma.hotel.create({
    data: {
      name: "Sunset Resort",
      address: "ბათუმი, შერიფ ხიმშიაშვილის 15",
      phone: "+995 422 20 00 02",
    },
  });

  const hotel3 = await prisma.hotel.create({
    data: {
      name: "Mountain Lodge",
      address: "გუდაური, მთავარი გზა 1",
      phone: "+995 32 200 00 03",
    },
  });

  console.log("🏨 სასტუმროები შეიქმნა:", hotel1.name, hotel2.name, hotel3.name);

  // პაროლი .env-დან მოდის, რომ Git-ში plaintext არ დარჩეს
  const seedAdminPassword = requireEnv("SEED_ADMIN_PASSWORD");
  const hashedPassword = await bcrypt.hash(seedAdminPassword, 10);

  // ყოველ სასტუმროში 1 ადმინი
  await prisma.user.createMany({
    data: [
      {
        email: "admin@eldream.ge",
        password: hashedPassword,
        name: "ელდრიმ ადმინი",
        role: "ADMIN",
        hotelId: hotel1.id,
      },
      {
        email: "admin@sunset.ge",
        password: hashedPassword,
        name: "სანსეტ ადმინი",
        role: "ADMIN",
        hotelId: hotel2.id,
      },
      {
        email: "admin@mountain.ge",
        password: hashedPassword,
        name: "მაუნთინ ადმინი",
        role: "ADMIN",
        hotelId: hotel3.id,
      },
    ],
  });

  console.log("👤 მომხმარებლები შეიქმნა");
  console.log("✅ Seed დასრულდა!");
}

main()
  .catch((e) => {
    console.error("❌ Seed შეცდომა:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
