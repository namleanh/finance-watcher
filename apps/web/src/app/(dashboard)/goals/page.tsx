'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import GoalCards from '@/components/goals/GoalCards';

export default function GoalsPage() {
  return (
    <div className="min-h-full pb-20">
      <Header title="Mục tiêu" />
      <div className="p-6">
        <GoalCards />
      </div>
    </div>
  );
}
