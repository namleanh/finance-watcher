'use client';

import React from 'react';
import { Shield, Target, TrendingUp, Lock, UserCheck, Wallet, PieChart, Landmark } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-6 shadow-xl shadow-indigo-500/20">
          <Wallet className="text-white w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Về Finance Watcher
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Ứng dụng quản lý tài chính cá nhân hiện đại, nơi sự đơn giản gặp gỡ bảo mật tuyệt đối.
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Quản lý dòng tiền</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Theo dõi mọi giao dịch thu nhập và chi tiêu. Giao diện trực quan giúp bạn hiểu rõ tiền của mình đang đi đâu chỉ trong vài giây.
          </p>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
            <Landmark size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Tiết kiệm & Đầu tư</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Hợp nhất tất cả các tài khoản tiết kiệm và danh mục đầu tư tại một nơi. Theo dõi biến động tài sản ròng theo thời gian.
          </p>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
            <Target size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Mục tiêu tài chính</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Đặt ra các mục tiêu tiết kiệm cụ thể và theo sát tiến độ. Chúng tôi giúp bạn có thêm động lực để đạt được tự do tài chính.
          </p>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-500 mb-6 group-hover:scale-110 transition-transform">
            <PieChart size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Dữ liệu thị trường</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Tích hợp sẵn công cụ theo dõi giá vàng và tỷ giá ngoại tệ, giúp bạn đưa ra các quyết định quy đổi và đầu tư chính xác.
          </p>
        </div>
      </div>

      {/* Security Section */}
      <div className="relative p-10 rounded-[3rem] bg-indigo-600 overflow-hidden shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Shield size={200} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
              <Lock className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Quyền riêng tư là ưu tiên số 1</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Shield size={16} /> Kiến trúc Zero-Knowledge
              </h4>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Chúng tôi không thể xem dữ liệu của bạn. Mọi thông tin nhạy cảm như Email, Tên hiển thị đều được mã hóa bằng thuật toán hiện đại trước khi lưu trữ. Chỉ bạn mới có chìa khóa để giải mã.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <UserCheck size={16} /> Kiểm soát tuyệt đối
              </h4>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Với tính năng "Privacy Mode", bạn có thể ẩn đi các con số tài chính khi hiển thị ở nơi công cộng. Dữ liệu của bạn thuộc về bạn, vĩnh viễn là như vậy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer message */}
      <div className="mt-16 text-center text-slate-400 dark:text-slate-500 text-xs">
        © 2026 Finance Watcher • Được thiết kế để bảo vệ tài chính cá nhân của bạn.
      </div>
    </div>
  );
}
