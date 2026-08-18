export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
  method: string;
  recurring: boolean;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  paymentDay: number;
  method: string;
  startDate: string;
  endDate: string | null;
}

export interface Installment {
  id: string;
  name: string;
  totalAmount: number;
  numInstallments: number;
  paidInstallments: number;
  startDate: string;
}

export interface Goal {
  id: string;
  name: string;
  goalAmount: number;
  saved: number;
  targetDate: string | null;
}

export type Budgets = Record<string, number>;

export interface FinanceData {
  initialBalance: number;
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  installments: Installment[];
  budgets: Budgets;
  goals: Goal[];
}

export type NewTransaction = Omit<Transaction, 'id'>;
export type NewFixedExpense = Omit<FixedExpense, 'id'>;
export type NewInstallment = Omit<Installment, 'id'>;
export type NewGoal = Omit<Goal, 'id'>;

export interface ModalState {
  type: 'transaction' | 'fixed' | 'installment' | 'goal' | 'contribute' | 'budget' | 'balance';
  txType?: TransactionType;
  goalId?: string;
  category?: string;
}
