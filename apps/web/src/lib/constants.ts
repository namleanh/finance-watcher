import { Currency } from './types';

// Exchange rates relative to USD (placeholder — swap in real API via exchangeRate.ts)
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  VND: 25400,
  MYR: 4.7,
};

export const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: 'VND', label: 'Vietnamese Dong', symbol: '₫' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM' },
];

export const GOAL_ICONS = ['🏠', '🚗', '✈️', '💍', '🎓', '💰', '📱', '⛵'];

export const GOAL_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#f97316', '#14b8a6',
];

export const CATEGORIES: {
  type: 'income' | 'expense';
  label: string;
  color: string;
  subCategories: string[];
}[] = [
  // Income
  {
    type: 'income', label: 'Lương', color: '#10b981',
    subCategories: ['Lương cơ bản', 'Thưởng', 'Phụ cấp'],
  },
  {
    type: 'income', label: 'Freelance', color: '#34d399',
    subCategories: ['Lập trình', 'Thiết kế', 'Tư vấn', 'Khác'],
  },
  {
    type: 'income', label: 'Đầu tư', color: '#6ee7b7',
    subCategories: ['Cổ tức', 'Tiền lãi', 'Bán tài sản'],
  },
  {
    type: 'income', label: 'Khác', color: '#a7f3d0',
    subCategories: ['Quà', 'Trợ cấp', 'Hoàn tiền', 'Khác'],
  },
  // Expense
  {
    type: 'expense', label: 'Ăn uống', color: '#f59e0b',
    subCategories: ['Cơm nhà', 'Nhà hàng', 'Cafe', 'Đồ uống', 'Bánh kẹo'],
  },
  {
    type: 'expense', label: 'Di chuyển', color: '#fb923c',
    subCategories: ['Xăng', 'Grab/Taxi', 'Xe buýt', 'Bãi giữ xe', 'Sửa xe'],
  },
  {
    type: 'expense', label: 'Nhà ở', color: '#ef4444',
    subCategories: ['Tiền thuê nhà', 'Điện', 'Nước', 'Internet', 'Gas', 'Sửa chữa'],
  },
  {
    type: 'expense', label: 'Mua sắm', color: '#e11d48',
    subCategories: ['Quần áo', 'Giày dép', 'Điện tử', 'Gia dụng', 'Khác'],
  },
  {
    type: 'expense', label: 'Sức khỏe', color: '#be185d',
    subCategories: ['Khám bệnh', 'Thuốc', 'Bảo hiểm y tế', 'Gym', 'Spa'],
  },
  {
    type: 'expense', label: 'Giải trí', color: '#7c3aed',
    subCategories: ['Xem phim', 'Du lịch', 'Game', 'Sách', 'Nhạc'],
  },
  {
    type: 'expense', label: 'Giáo dục', color: '#4f46e5',
    subCategories: ['Học phí', 'Sách giáo trình', 'Khóa học online', 'Văn phòng phẩm'],
  },
  {
    type: 'expense', label: 'Đăng ký dịch vụ', color: '#0891b2',
    subCategories: ['Netflix', 'Spotify', 'Phần mềm', 'Điện thoại', 'Khác'],
  },
  {
    type: 'expense', label: 'Khác', color: '#64748b',
    subCategories: ['Từ thiện', 'Quà tặng', 'Phí ngân hàng', 'Khác'],
  },
];
