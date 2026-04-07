import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard padding
const DELIMITER = 'ꞈ'; // Rare Unicode delimiter to separate IV, AuthTag, and Ciphertext

let masterKeyBuffer: Buffer | null = null;
const getMasterKey = () => {
  if (!masterKeyBuffer) {
    const secret = process.env.ENCRYPTION_SECRET_KEY;
    if (!secret || secret.length < 32) {
      console.warn('⚠️ BÁO ĐỘNG BẢO MẬT: Không tìm thấy ENCRYPTION_SECRET_KEY trong .env (hoặc quá ngắn). Hệ thống sẽ dùng khóa tạm bợ. Hãy thêm ngay vào .env!');
    }
    masterKeyBuffer = Buffer.from(secret || 'TuiDayLaMotCaiChiaKhoaDu32KyTuDo', 'utf8');
  }
  return masterKeyBuffer;
};

/**
 * Thuật toán sinh khóa định danh:
 * Lấy Khóa Hệ Thống + ID Khách Hàng -> Trộn lại và Băm (SHA256)
 * Đảm bảo mỗi khách hàng sở hữu một Chìa Khóa Bí Mật (AES-256) biệt lập.
 */
const deriveUserKey = (userId: string): Buffer => {
  return crypto.createHash('sha256')
    .update(getMasterKey())
    .update(userId) // Trộn ID khách để sinh khóa độc nhất
    .digest();
};

export const encryptNote = (text: string | null | undefined, userId: string): string | null => {
  if (!text || text.trim() === '') return text as null;
  try {
    const key = deriveUserKey(userId);
    const iv = crypto.randomBytes(IV_LENGTH); // IV ngẫu nhiên mỗi lần lưu
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag().toString('base64');

    // Lưu mã ghép: IV ꞈ TAG ꞈ MẬT MÃ
    return `${iv.toString('base64')}${DELIMITER}${authTag}${DELIMITER}${encrypted}`;
  } catch (error) {
    console.error(`[Security] Lỗi mã hóa dữ liệu của User: ${userId}`, error);
    // Nếu có lỗi, thà rớt mã hóa và throw còn hơn lưu sai
    throw new Error('Lỗi mã hóa bảo mật');
  }
};

export const decryptNote = (encryptedText: string | null | undefined, userId: string): string | null => {
  if (!encryptedText) return encryptedText as null;
  
  // Nếu dữ liệu cũ lưu trong DB là chữ thường, nó sẽ không có cái dấu phân cách kỳ dị này, ném thẳng ra luôn
  if (!encryptedText.includes(DELIMITER)) return encryptedText;

  try {
    const parts = encryptedText.split(DELIMITER);
    if (parts.length !== 3) return encryptedText;

    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const ciphertext = parts[2];
    const key = deriveUserKey(userId);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error(`[Security] Lỗi giải mã dữ liệu của User: ${userId}`, error);
    return '🔒 Dữ liệu đã bị hỏng khóa bảo mật';
  }
};
