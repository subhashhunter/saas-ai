import { PrismaClient } from "@prisma/client";
const primaClientSingleton=()=>{
    return new PrismaClient;
}
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined}
export const prisma = globalForPrisma.prisma ?? primaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma