import { PrismaClient } from '@prisma/client'

// Simples assim. O Prisma busca o DATABASE_URL do ambiente automaticamente.
export const prisma = new PrismaClient()