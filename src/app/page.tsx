import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  rowToFixedExpense, rowToGoal, rowToInstallment, rowToTransaction, rowsToBudgets,
} from '@/lib/mappers';
import type { FinanceData } from '@/types';
import type {
  BudgetRow, FixedExpenseRow, GoalRow, InstallmentRow, TransactionRow, UserSettingsRow,
} from '@/types/database';
import AppShell from '@/components/AppShell';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [settingsRes, transactionsRes, fixedRes, installmentsRes, budgetsRes, goalsRes] = await Promise.all([
    supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('fixed_expenses').select('*').eq('user_id', user.id),
    supabase.from('installments').select('*').eq('user_id', user.id),
    supabase.from('budgets').select('*').eq('user_id', user.id),
    supabase.from('goals').select('*').eq('user_id', user.id),
  ]);

  const settings = settingsRes.data as UserSettingsRow | null;

  const initialData: FinanceData = {
    initialBalance: settings ? Number(settings.initial_balance) : 0,
    transactions: ((transactionsRes.data ?? []) as TransactionRow[]).map(rowToTransaction),
    fixedExpenses: ((fixedRes.data ?? []) as FixedExpenseRow[]).map(rowToFixedExpense),
    installments: ((installmentsRes.data ?? []) as InstallmentRow[]).map(rowToInstallment),
    budgets: rowsToBudgets((budgetsRes.data ?? []) as BudgetRow[]),
    goals: ((goalsRes.data ?? []) as GoalRow[]).map(rowToGoal),
  };

  return <AppShell initialData={initialData} userId={user.id} />;
}
