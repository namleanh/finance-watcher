import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const data = await prisma.marketData.findMany({
    select: { symbol: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  });
  console.log(JSON.stringify(data, null, 2));
  await prisma.$disconnect();
}

main();
