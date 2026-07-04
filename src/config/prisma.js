import { PrismaClient } from "@prisma/client";

// Instancia única de Prisma reutilizada en toda la app (evita agotar conexiones)
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export default prisma;
