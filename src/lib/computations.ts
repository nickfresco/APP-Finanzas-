import type { FinanceData } from '@/types';
import { isSameMonth } from '@/lib/utils';

export interface WeekCategoryRow {
  cat: string;
  amt: number;
  pct: number;
}

export interface ChartWeek {
  week: string;
  ingresos: number;
  gastos: number;
}

export interface ComputedFinance {
  monthIncome: number;
  monthVariableExpense: number;
  fixedTotal: number;
  installmentMonthly: number;
  totalExpenses: number;
  estimatedSavings: number;
  available: number;
  spentByCategory: Record<string, number>;
  chartData: ChartWeek[];
  healthMsg: string;
  healthTone: 'green' | 'red' | 'neutral';
  weekIncome: number;
  weekExpense: number;
  weekCategoryRows: WeekCategoryRow[];
}

export function computeFinance(data: FinanceData, now: Date): ComputedFinance {
  const monthIncome = data.transactions
    .filter((t) => t.type === 'income' && (t.recurring || isSameMonth(t.date, now)))
    .reduce((s, t) => s + t.amount, 0);
  const monthVariableExpense = data.transactions
    .filter((t) => t.type === 'expense' && (t.recurring || isSameMonth(t.date, now)))
    .reduce((s, t) => s + t.amount, 0);
  const fixedTotal = data.fixedExpenses
    .filter((f) => !f.endDate || new Date(f.endDate) >= now)
    .reduce((s, f) => s + f.amount, 0);
  const installmentMonthly = data.installments
    .filter((i) => i.paidInstallments < i.numInstallments)
    .reduce((s, i) => s + i.totalAmount / i.numInstallments, 0);
  const totalExpenses = monthVariableExpense + fixedTotal + installmentMonthly;
  const estimatedSavings = monthIncome - totalExpenses;
  const available = data.initialBalance + estimatedSavings;

  const spentByCategory: Record<string, number> = {};
  data.transactions
    .filter((t) => t.type === 'expense' && isSameMonth(t.date, now))
    .forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
    });

  const chartData: ChartWeek[] = [
    { week: 'Sem 1', ingresos: 0, gastos: 0 },
    { week: 'Sem 2', ingresos: 0, gastos: 0 },
    { week: 'Sem 3', ingresos: 0, gastos: 0 },
    { week: 'Sem 4', ingresos: 0, gastos: 0 },
  ];
  data.transactions.forEach((t) => {
    if (!isSameMonth(t.date, now)) return;
    const day = new Date(t.date + 'T00:00:00').getDate();
    const idx = Math.min(3, Math.floor((day - 1) / 7));
    if (t.type === 'income') chartData[idx].ingresos += t.amount;
    else chartData[idx].gastos += t.amount;
  });

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const prevMonthVariable = data.transactions
    .filter((t) => t.type === 'expense' && isSameMonth(t.date, prevMonthDate))
    .reduce((s, t) => s + t.amount, 0);
  const currMonthVariable = data.transactions
    .filter((t) => t.type === 'expense' && isSameMonth(t.date, now))
    .reduce((s, t) => s + t.amount, 0);

  let healthMsg: string;
  let healthTone: 'green' | 'red' | 'neutral';
  if (prevMonthVariable <= 0) {
    healthMsg = 'Sigue registrando tus movimientos — con más historial podremos comparar tus meses.';
    healthTone = 'neutral';
  } else {
    const pct = Math.round(((currMonthVariable - prevMonthVariable) / prevMonthVariable) * 100);
    if (pct <= -5) {
      healthMsg = `Vas bien. Tus gastos variables son ${Math.abs(pct)}% más bajos que el mes pasado.`;
      healthTone = 'green';
    } else if (pct >= 15) {
      healthMsg = `Tus gastos variables están ${pct}% por sobre el mes pasado.`;
      healthTone = 'red';
    } else {
      healthMsg = `Tus gastos variables se mantienen estables respecto al mes pasado (${pct >= 0 ? '+' : ''}${pct}%).`;
      healthTone = 'neutral';
    }
  }

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekTx = data.transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00');
    return d >= weekAgo && d <= now;
  });
  const weekIncome = weekTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const weekExpense = weekTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const weekByCat: Record<string, number> = {};
  weekTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      weekByCat[t.category] = (weekByCat[t.category] || 0) + t.amount;
    });
  const weekCategoryRows: WeekCategoryRow[] = Object.entries(weekByCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, amt]) => ({ cat, amt, pct: weekExpense ? Math.round((amt / weekExpense) * 100) : 0 }));

  return {
    monthIncome,
    monthVariableExpense,
    fixedTotal,
    installmentMonthly,
    totalExpenses,
    estimatedSavings,
    available,
    spentByCategory,
    chartData,
    healthMsg,
    healthTone,
    weekIncome,
    weekExpense,
    weekCategoryRows,
  };
}
