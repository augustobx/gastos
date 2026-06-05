import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

try {
  const adapter = new PrismaMariaDb({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gastos',
    connectionLimit: 10
  } as any);
  const prisma = new PrismaClient({ adapter });
  
  async function test() {
    try {
      const data = await prisma.transaction.findMany();
      console.log("Success! Data:", data);
    } catch(e) {
      console.error("Query failed:", e);
    }
  }
  
  test();
} catch (e) {
  console.error("Failed to instantiate Prisma:", e);
}
