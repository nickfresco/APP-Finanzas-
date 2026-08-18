// Tipos de fila que matchean supabase/schema.sql

export interface UserSettingsRow {
  user_id: string;
  initial_balance: number;
  updated_at: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string | null;
  method: string | null;
  recurring: boolean;
  created_at: string;
}

export interface FixedExpenseRow {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  payment_day: number;
  method: string | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface InstallmentRow {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  num_installments: number;
  paid_installments: number;
  start_date: string;
  created_at: string;
}

export interface BudgetRow {
  user_id: string;
  category: string;
  amount: number;
}

export interface GoalRow {
  id: string;
  user_id: string;
  name: string;
  goal_amount: number;
  saved: number;
  target_date: string | null;
  created_at: string;
}
