import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const dbUrl = new URL(process.env.DATABASE_URL || "mysql://root:@localhost:3306/gastos");

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace("/", ""),
  connectionLimit: 10
} as any);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

