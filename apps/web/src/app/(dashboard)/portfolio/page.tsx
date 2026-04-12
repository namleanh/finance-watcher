'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import PortfolioTable from '@/components/portfolio/PortfolioTable';

export default function PortfolioPage() {
  return (
    <div className="min-h-full pb-20">
      <Header title="Đầu tư" />
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <PortfolioTable />
      </div>
    </div>
  );
}
