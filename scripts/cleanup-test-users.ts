import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: "verify@" } },
    select: { id: true, email: true },
  });
  for (const u of users) {
    await prisma.review.deleteMany({ where: { OR: [{ reviewerId: u.id }, { targetId: u.id }] } });
    await prisma.listing.deleteMany({ where: { profile: { userId: u.id } } });
    await prisma.profile.deleteMany({ where: { userId: u.id } });
    await prisma.session.deleteMany({ where: { userId: u.id } });
    await prisma.account.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
    console.log("Deleted:", u.email);
  }
  console.log("Done");
}

main().catch(console.error).finally(() => prisma.$disconnect());
