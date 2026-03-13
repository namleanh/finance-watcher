'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { FinanceState, FinanceAction, Transaction, PortfolioAsset, SavingsGoal, RecurringItem } from '@/lib/types';
import { uid } from '@/lib/utils';

const STORAGE_KEY = 'finance-watcher-state';

const initialState: FinanceState = {
  transactions: [],
  portfolioAssets: [],
  savingsGoals: [],
  recurringItems: [],
  baseCurrency: 'VND',
};

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case 'ADD_PORTFOLIO_ASSET':
      return { ...state, portfolioAssets: [action.payload, ...state.portfolioAssets] };
    case 'UPDATE_PORTFOLIO_ASSET':
      return {
        ...state,
        portfolioAssets: state.portfolioAssets.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_PORTFOLIO_ASSET':
      return { ...state, portfolioAssets: state.portfolioAssets.filter(a => a.id !== action.payload) };
    case 'ADD_GOAL':
      return { ...state, savingsGoals: [action.payload, ...state.savingsGoals] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(g =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
    case 'DELETE_GOAL':
      return { ...state, savingsGoals: state.savingsGoals.filter(g => g.id !== action.payload) };
    case 'ADD_RECURRING':
      return { ...state, recurringItems: [action.payload, ...state.recurringItems] };
    case 'DELETE_RECURRING':
      return { ...state, recurringItems: state.recurringItems.filter(r => r.id !== action.payload) };
    default:
      return state;
  }
}

interface FinanceContextValue {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  addPortfolioAsset: (a: Omit<PortfolioAsset, 'id'>) => void;
  updatePortfolioAsset: (a: PortfolioAsset) => void;
  deletePortfolioAsset: (id: string) => void;
  addGoal: (g: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (g: SavingsGoal) => void;
  deleteGoal: (id: string) => void;
  addRecurring: (r: Omit<RecurringItem, 'id'>) => void;
  deleteRecurring: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved) });
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);


  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: { ...t, id: uid(), createdAt: new Date().toISOString() } });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }, []);

  const addPortfolioAsset = useCallback((a: Omit<PortfolioAsset, 'id'>) => {
    dispatch({ type: 'ADD_PORTFOLIO_ASSET', payload: { ...a, id: uid() } });
  }, []);

  const updatePortfolioAsset = useCallback((a: PortfolioAsset) => {
    dispatch({ type: 'UPDATE_PORTFOLIO_ASSET', payload: a });
  }, []);

  const deletePortfolioAsset = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PORTFOLIO_ASSET', payload: id });
  }, []);

  const addGoal = useCallback((g: Omit<SavingsGoal, 'id'>) => {
    dispatch({ type: 'ADD_GOAL', payload: { ...g, id: uid() } });
  }, []);

  const updateGoal = useCallback((g: SavingsGoal) => {
    dispatch({ type: 'UPDATE_GOAL', payload: g });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
  }, []);

  const addRecurring = useCallback((r: Omit<RecurringItem, 'id'>) => {
    dispatch({ type: 'ADD_RECURRING', payload: { ...r, id: uid() } });
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    dispatch({ type: 'DELETE_RECURRING', payload: id });
  }, []);

  return (
    <FinanceContext.Provider value={{
      state, dispatch,
      addTransaction, deleteTransaction,
      addPortfolioAsset, updatePortfolioAsset, deletePortfolioAsset,
      addGoal, updateGoal, deleteGoal,
      addRecurring, deleteRecurring,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
