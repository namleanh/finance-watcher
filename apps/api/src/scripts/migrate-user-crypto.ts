import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { generateBlindIndex, encryptField } from '../utils/crypto.util';

const prisma = new PrismaClient();
const DELIMITER = 'ꞈ';

async function main() {
  console.log('👤 Đang kiểm tra danh sách Người Dùng để bảo mật danh tính...');
  
  const users = await prisma.user.findMany();
  let userCount = 0;

  for (const user of users) {
    let needsUpdate = false;
    const updates: any = {};

    if (!user.emailHash) {
      updates.emailHash = generateBlindIndex(user.email);
      needsUpdate = true;
    }
    if (!user.email.includes(DELIMITER)) {
      updates.email = encryptField(user.email, user.id);
      needsUpdate = true;
    }

    if (!user.usernameHash) {
      updates.usernameHash = generateBlindIndex(user.username);
      needsUpdate = true;
    }
    if (!user.username.includes(DELIMITER)) {
      updates.username = encryptField(user.username, user.id);
      needsUpdate = true;
    }

    if (user.displayName && !user.displayName.includes(DELIMITER)) {
      updates.displayName = encryptField(user.displayName, user.id);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });
      userCount++;
    }
  }

  console.log(`✅ Đã "bọc thép" danh tính cho ${userCount} người dùng.`);

  console.log('💳 Đang bảo mật tên các Ví tiền...');
  const wallets = await prisma.wallet.findMany();
  let walletCount = 0;
  for (const wallet of wallets) {
    let needsUpdate = false;
    const updates: any = {};

    if (!wallet.nameHash) {
      updates.nameHash = generateBlindIndex(wallet.name);
      needsUpdate = true;
    }
    if (!wallet.name.includes(DELIMITER)) {
      updates.name = encryptField(wallet.name, wallet.userId);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: updates,
      });
      walletCount++;
    }
  }
  console.log(`✅ Đã ẩn danh ${walletCount} ví tiền.`);

  console.log('🏦 Đang bảo mật tên các Ngân hàng trong Tiết kiệm...');
  const deposits = await prisma.savingsDeposit.findMany();
  let depositCount = 0;
  for (const deposit of deposits) {
    let needsUpdate = false;
    const updates: any = {};

    if (!deposit.bankNameHash) {
      updates.bankNameHash = generateBlindIndex(deposit.bankName);
      needsUpdate = true;
    }
    if (!deposit.bankName.includes(DELIMITER)) {
      updates.bankName = encryptField(deposit.bankName, deposit.userId);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.savingsDeposit.update({
        where: { id: deposit.id },
        data: updates,
      });
      depositCount++;
    }
  }
  console.log(`✅ Đã ẩn danh ${depositCount} khoản tiết kiệm.`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Migrate:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
