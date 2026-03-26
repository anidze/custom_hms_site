import { PrismaClient } from "@prisma/client";

// globalThis-ზე ვინახავთ Prisma-ს ინსტანსს
// რომ dev mode-ში hot reload-ით ახალი კავშირები არ შეიქმნას
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
