'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Target } from 'lucide-react';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/api/useGoals';
import { formatCurrency } from '@/lib/exchangeRate';
import { getGoalProgress } from '@/lib/financeUtils';
import { SavingsGoal } from '@/lib/types';
import { GOAL_COLORS, GOAL_ICONS } from '@/lib/constants';
import { format, differenceInDays, parseISO } from 'date-fns';

function GoalModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing?: SavingsGoal }) {
  const { mutateAsync: createGoal } = useCreateGoal();
  const { mutateAsync: editGoal } = useUpdateGoal();

  // If editing, deadline is likely ISO string, safely format it to yyyy-MM-dd for the date picker
  const initDeadline = editing?.deadline 
    ? format(parseISO(editing.deadline as string), 'yyyy-MM-dd') 
    : format(new Date(new Date().getFullYear() + 1, 0, 1), 'yyyy-MM-dd');

  const [name, setName] = useState(editing?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(editing?.targetAmount.toString() ?? '');
  const [currentAmount, setCurrentAmount] = useState(editing?.currentAmount.toString() ?? '0');
  const [deadline, setDeadline] = useState(initDeadline);
  const [color, setColor] = useState(editing?.color ?? GOAL_COLORS[0]);
  const [icon, setIcon] = useState(editing?.icon ?? GOAL_ICONS[0]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: new Date(deadline).toISOString(), 
      color, 
      icon,
    };
    try {
      if (editing) {
        await editGoal({ ...data, id: editing.id });
      } else {
        await createGoal(data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Đã lỗi, vui lòng thử lại!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <h2 className="font-semibold text-white mb-4">{editing ? 'Cập nhật mục tiêu' : 'Thêm mục tiêu tiết kiệm'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tên mục tiêu</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Mua nhà 2027" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Mục tiêu (₫)</label>
              <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required placeholder="1000000000" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {editing && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Đã tiết kiệm (₫)</label>
                <input type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="0" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Hạn chót</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${icon === ic ? 'ring-2 ring-indigo-500 bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-all">Hủy</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg hover:from-indigo-600 hover:to-violet-700 transition-all">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GoalCards() {
  const { data: goals = [], isLoading } = useGoals();
  const { mutate: deleteGoal } = useDeleteGoal();
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | undefined>();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Mục tiêu tiết kiệm</h2>
          <p className="text-xs text-slate-400">{goals.length} mục tiêu đang theo dõi</p>
        </div>
        <button
          onClick={() => { setEditing(undefined); setShowModal(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all"
        >
          <Plus size={13} /> Thêm mục tiêu
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col items-center justify-center py-20 text-slate-500">
          <Target size={48} className="mb-4 opacity-30" />
          <p className="font-medium text-slate-400">Chưa có mục tiêu nào</p>
          <p className="text-sm mt-1">Thiết lập mục tiêu để theo dõi tiến độ tiết kiệm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal: any) => {
            const progress = getGoalProgress(goal);
            const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : 0;
            return (
              <div key={goal.id} className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl border border-slate-100 dark:border-transparent" style={{ backgroundColor: `${goal.color}20` }}>
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{goal.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã quá hạn'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditing(goal); setShowModal(true); }} className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit2 size={12} /></button>
                    <button 
                      onClick={() => {
                        if (confirm('Bạn có chắc muốn xóa mục tiêu này?')) deleteGoal(goal.id);
                      }} 
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"><Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Đã tiết kiệm</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{formatCurrency(goal.currentAmount, 'VND', true)}</span>
                    <span>{formatCurrency(goal.targetAmount, 'VND', true)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between text-xs text-slate-400">
                  <span>Hạn: {goal.deadline ? format(parseISO(goal.deadline), 'dd/MM/yyyy') : 'Không hạn'}</span>
                  <span style={{ color: goal.color }}>
                    Cần thêm {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount), 'VND', true)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Force remount modal strictly to clear state */}
      {showModal && (
        <GoalModal open={showModal} onClose={() => setShowModal(false)} editing={editing} />
      )}
    </div>
  );
}
