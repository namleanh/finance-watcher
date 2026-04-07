import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { generateBlindIndex, decryptField } from '../utils/crypto.util';

const prisma = new PrismaClient();

async function verify() {
  const users = await prisma.user.findMany();
  console.log(`Checking ${users.length} users:`);
  
  for (const user of users) {
    const plainEmail = decryptField(user.email, user.id);
    const plainUsername = decryptField(user.username, user.id);
    const calculatedEmailHash = generateBlindIndex(plainEmail);
    const calculatedUsernameHash = generateBlindIndex(plainUsername);

    console.log(`--- User ID: ${user.id} ---`);
    console.log(`Email (Cipher): ${user.email.substring(0, 20)}...`);
    console.log(`Email (Plain): ${plainEmail}`);
    console.log(`Hash Matches: ${user.emailHash === calculatedEmailHash ? '✅' : '❌'}`);
    console.log(`Username (Plain): ${plainUsername}`);
    console.log(`Username Hash Matches: ${user.usernameHash === calculatedUsernameHash ? '✅' : '❌'}`);
  }
}

verify().finally(() => prisma.$disconnect());
