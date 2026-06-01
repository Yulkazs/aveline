import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma/client';

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const modifiedConnectionString = connectionString.includes('sslmode=')
    ? connectionString.replace(/sslmode=\w+/, 'sslmode=verify-full')
    : connectionString + (connectionString.includes('?') ? '&' : '?') + 'sslmode=verify-full';

  const pool = new Pool({
    connectionString: modifiedConnectionString,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Singleton — reuse in dev (hot reload), create fresh in prod
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;