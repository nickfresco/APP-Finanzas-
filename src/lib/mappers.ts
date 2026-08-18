import type {
  BudgetRow,
  FixedExpenseRow,
  GoalRow,
  InstallmentRow,
  TransactionRow,
} from '@/types/database';
import type {
  Budgets,
  FixedExpense,
  Goal,
  Installment,
  NewFixedExpense,
  NewGoal,
  NewInstallment,
  NewTransaction,
  Transaction,
} from '@/types';

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    date: row.date,
    description: row.description ?? '',
    method: row.method ?? '',
    recurring: row.recurring,
  };
}

export function transactionToInsert(input: NewTransaction, userId: string) {
  return {
    user_id: userId,
    type: input.type,
    amount: input.amount,
    category: input.category,
    date: input.date,
    description: input.description || null,
    method: input.method || null,
    recurring: input.recurring,
  };
}

export function rowToFixedExpense(row: FixedExpenseRow): FixedExpense {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    category: row.category,
    paymentDay: row.payment_day,
    method: row.method ?? '',
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export function fixedExpenseToInsert(input: NewFixedExpense, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    amount: input.amount,
    category: input.category,
    payment_day: input.paymentDay,
    method: input.method || null,
    start_date: input.startDate,
    end_date: input.endDate || null,
  };
}

export function rowToInstallment(row: InstallmentRow): Installment {
  return {
    id: row.id,
    name: row.name,
    totalAmount: Number(row.total_amount),
    numInstallments: row.num_installments,
    paidInstallments: row.paid_installments,
    startDate: row.start_date,
  };
}

export function installmentToInsert(input: NewInstallment, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    total_amount: input.totalAmount,
    num_installments: input.numInstallments,
    paid_installments: input.paidInstallments,
    start_date: input.startDate,
  };
}

export function rowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    goalAmount: Number(row.goal_amount),
    saved: Number(row.saved),
    targetDate: row.target_date,
  };
}

export function goalToInsert(input: NewGoal, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    goal_amount: input.goalAmount,
    saved: input.saved,
    target_date: input.targetDate || null,
  };
}

export function rowsToBudgets(rows: BudgetRow[]): Budgets {
  const budgets: Budgets = {};
  rows.forEach((row) => {
    budgets[row.category] = Number(row.amount);
  });
  return budgets;
}
