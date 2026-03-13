'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import PortfolioTable from '@/components/portfolio/PortfolioTable';

export default function PortfolioPage() {
  return (
    <div className="min-h-full pb-20">
      <Header title="Đầu tư" subtitle="Theo dõi danh mục và P&L" />
      <div className="p-6">
        <PortfolioTable />
      </div>
    </div>
  );
}
