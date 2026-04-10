import { Currency, TransactionType } from './types';

// Exchange rates relative to VND (VND per 1 unit of currency)
export const EXCHANGE_RATES: Record<Currency, number> = {
  VND: 1,
  USD: 25400,
  MYR: 5400,
  EUR: 27600,
  JPY: 167,
  GBP: 32150,
  AUD: 16600,
  SGD: 18814,
  KRW: 18.67,
};

export const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: 'VND', label: 'Vietnamese Dong', symbol: 'đ' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
  { code: 'KRW', label: 'South Korean Won', symbol: '₩' },
];

export const GOAL_ICONS = ['🏠', '🚗', '✈️', '💍', '🎓', '💰', '📱', '⛵'];

export const GOAL_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#f97316', '#14b8a6',
];

export const CATEGORIES: {
  type: TransactionType;
  label: string;
  color: string;
  subCategories: string[];
}[] = [
  // INCOME
  {
    type: 'INCOME', label: 'Lương', color: '#10b981',
    subCategories: ['Lương cơ bản', 'Thưởng', 'Phụ cấp'],
  },
  {
    type: 'INCOME', label: 'Freelance', color: '#34d399',
    subCategories: ['Lập trình', 'Thiết kế', 'Tư vấn', 'Khác'],
  },
  {
    type: 'INCOME', label: 'Đầu tư', color: '#6ee7b7',
    subCategories: ['Cổ tức', 'Tiền lãi', 'Bán tài sản'],
  },
  {
    type: 'INCOME', label: 'Khác', color: '#a7f3d0',
    subCategories: ['Quà', 'Trợ cấp', 'Hoàn tiền', 'Khác'],
  },
  // EXPENSE
  {
    type: 'EXPENSE', label: 'Ăn uống', color: '#f59e0b',
    subCategories: ['Cơm nhà', 'Nhà hàng', 'Cafe', 'Đồ uống', 'Bánh kẹo'],
  },
  {
    type: 'EXPENSE', label: 'Di chuyển', color: '#fb923c',
    subCategories: ['Xăng', 'Grab/Taxi', 'Xe buýt', 'Bãi giữ xe', 'Sửa xe'],
  },
  {
    type: 'EXPENSE', label: 'Nhà ở', color: '#ef4444',
    subCategories: ['Tiền thuê nhà', 'Điện', 'Nước', 'Internet', 'Gas', 'Sửa chữa'],
  },
  {
    type: 'EXPENSE', label: 'Mua sắm', color: '#e11d48',
    subCategories: ['Siêu thị', 'Quần áo', 'Giày dép', 'Điện tử', 'Gia dụng', 'Khác'],
  },
  {
    type: 'EXPENSE', label: 'Sức khỏe', color: '#be185d',
    subCategories: ['Khám bệnh', 'Thuốc', 'Bảo hiểm y tế', 'Gym', 'Spa'],
  },
  {
    type: 'EXPENSE', label: 'Giải trí', color: '#7c3aed',
    subCategories: ['Xem phim', 'Du lịch', 'Game', 'Sách', 'Nhạc'],
  },
  {
    type: 'EXPENSE', label: 'Giáo dục', color: '#4f46e5',
    subCategories: ['Học phí', 'Sách giáo trình', 'Khóa học online', 'Văn phòng phẩm'],
  },
  {
    type: 'EXPENSE', label: 'Đăng ký dịch vụ', color: '#0891b2',
    subCategories: ['Netflix', 'Spotify', 'Phần mềm', 'Điện thoại', 'Khác'],
  },
  {
    type: 'EXPENSE', label: 'Khác', color: '#64748b',
    subCategories: ['Từ thiện', 'Quà tặng', 'Phí ngân hàng', 'Khác'],
  },
  // SAVING
  {
    type: 'SAVING', label: 'Tiết kiệm', color: '#3b82f6',
    subCategories: ['Gửi tiền', 'Lãi tiết kiệm', 'Khác'],
  },
  // INVESTMENT
  {
    type: 'INVESTMENT', label: 'Đầu tư', color: '#8b5cf6',
    subCategories: ['Mua tài sản', 'Bán tài sản', 'Phí giao dịch', 'Khác'],
  },
];
