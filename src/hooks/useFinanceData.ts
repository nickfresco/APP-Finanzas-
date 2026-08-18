'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  fixedExpenseToInsert,
  goalToInsert,
  installmentToInsert,
  rowToFixedExpense,
  rowToGoal,
  rowToInstallment,
  rowToTransaction,
  transactionToInsert,
} from '@/lib/mappers';
import type { FinanceData, NewFixedExpense, NewGoal, NewInstallment, NewTransaction } from '@/types';
import type { FixedExpenseRow, GoalRow, InstallmentRow, TransactionRow } from '@/types/database';

export function useFinanceData(initialData: FinanceData, userId: string) {
  const [data, setData] = useState<FinanceData>(initialData);
  const [supabase] = useState(() => createClient());

  const addTransaction = useCallback(
    async (input: NewTransaction) => {
      const { data: row, error } = await supabase
        .from('transactions')
        .insert(transactionToInsert(input, userId))
        .select()
        .single();
      if (error || !row) { console.error(error); return; }
      setData((d) => ({ ...d, transactions: [...d.transactions, rowToTransaction(row as TransactionRow)] }));
    },
    [supabase, userId]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }));
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) console.error(error);
    },
    [supabase]
  );

  const addFixed = useCallback(
    async (input: NewFixedExpense) => {
      const { data: row, error } = await supabase
        .from('fixed_expenses')
        .insert(fixedExpenseToInsert(input, userId))
        .select()
        .single();
      if (error || !row) { console.error(error); return; }
      setData((d) => ({ ...d, fixedExpenses: [...d.fixedExpenses, rowToFixedExpense(row as FixedExpenseRow)] }));
    },
    [supabase, userId]
  );

  const deleteFixed = useCallback(
    async (id: string) => {
      setData((d) => ({ ...d, fixedExpenses: d.fixedExpenses.filter((f) => f.id !== id) }));
      const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
      if (error) console.error(error);
    },
    [supabase]
  );

  const addInstallment = useCallback(
    async (input: NewInstallment) => {
      const { data: row, error } = await supabase
        .from('installments')
        .insert(installmentToInsert(input, userId))
        .select()
        .single();
      if (error || !row) { console.error(error); return; }
      setData((d) => ({ ...d, installments: [...d.installments, rowToInstallment(row as InstallmentRow)] }));
    },
    [supabase, userId]
  );

  const deleteInstallment = useCallback(
    async (id: string) => {
      setData((d) => ({ ...d, installments: d.installments.filter((i) => i.id !== id) }));
      const { error } = await supabase.from('installments').delete().eq('id', id);
      if (error) console.error(error);
    },
    [supabase]
  );

  const payInstallment = useCallback(
    async (id: string) => {
      let nextPaid = 0;
      setData((d) => {
        const inst = d.installments.find((i) => i.id === id);
        if (!inst) return d;
        nextPaid = Math.min(inst.numInstallments, inst.paidInstallments + 1);
        return {
          ...d,
          installments: d.installments.map((i) => (i.id === id ? { ...i, paidInstallments: nextPaid } : i)),
        };
      });
      const { error } = await supabase.from('installments').update({ paid_installments: nextPaid }).eq('id', id);
      if (error) console.error(error);
    },
    [supabase]
  );

  const addGoal = useCallback(
    async (input: NewGoal) => {
      const { data: row, error } = await supabase
        .from('goals')
        .insert(goalToInsert(input, userId))
        .select()
        .single();
      if (error || !row) { console.error(error); return; }
      setData((d) => ({ ...d, goals: [...d.goals, rowToGoal(row as GoalRow)] }));
    },
    [supabase, userId]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) console.error(error);
    },
    [supabase]
  );

  const contributeGoal = useCallback(
    async (id: string, amt: number) => {
      let nextSaved = 0;
      setData((d) => {
        const goal = d.goals.find((g) => g.id === id);
        if (!goal) return d;
        nextSaved = goal.saved + amt;
        return { ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, saved: nextSaved } : g)) };
      });
      const { error } = await supabase.from('goals').update({ saved: nextSaved }).eq('id', id);
      if (error) console.error(error);
    },
    [supabase]
  );

  const setBudget = useCallback(
    async (category: string, amount: number) => {
      setData((d) => ({ ...d, budgets: { ...d.budgets, [category]: amount } }));
      const { error } = await supabase
        .from('budgets')
        .upsert({ user_id: userId, category, amount }, { onConflict: 'user_id,category' });
      if (error) console.error(error);
    },
    [supabase, userId]
  );

  const setBalance = useCallback(
    async (amount: number) => {
      setData((d) => ({ ...d, initialBalance: amount }));
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          { user_id: userId, initial_balance: amount, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      if (error) console.error(error);
    },
    [supabase, userId]
  );

  return {
    data,
    addTransaction,
    deleteTransaction,
    addFixed,
    deleteFixed,
    addInstallment,
    deleteInstallment,
    payInstallment,
    addGoal,
    deleteGoal,
    contributeGoal,
    setBudget,
    setBalance,
  };
}
