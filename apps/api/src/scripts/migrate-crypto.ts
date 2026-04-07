import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { encryptNote } from '../utils/crypto.util';

const prisma = new PrismaClient();
const DELIMITER = 'ꞈ';

async function main() {
  console.log('🔍 Đang kiểm tra toàn bộ dữ liệu Giao Dịch trong Database...');
  
  const transactions = await prisma.transaction.findMany();
  let updatedCount = 0;

  for (const t of transactions) {
    let needsUpdate = false;
    const updates: any = {};

    // Kiểm tra từng trường, nếu có nội dung nhưng LẠI KHÔNG CÓ ký tự phân cách (DELIMITER)
    // Chứng tỏ nó là Plaintext (Chữ nguyên bản mộc mạc cũ)
    if (t.category && !t.category.includes(DELIMITER)) {
      updates.category = encryptNote(t.category, t.userId);
      needsUpdate = true;
    }
    
    if (t.subCategory && !t.subCategory.includes(DELIMITER)) {
      updates.subCategory = encryptNote(t.subCategory, t.userId);
      needsUpdate = true;
    }
    
    if (t.notes && !t.notes.includes(DELIMITER)) {
      updates.notes = encryptNote(t.notes, t.userId);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.transaction.update({
        where: { id: t.id },
        data: updates,
      });
      updatedCount++;
    }
  }

  console.log(`✅ Hoàn tất! Đã tìm thấy và bọc thép thành công cho ${updatedCount} giao dịch cũ.`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Migrate:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
