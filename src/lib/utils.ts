import { EXPENSE_CATEGORIES, MONTHS_ES } from '@/lib/constants';

export const fmt = (n: number) => '$' + Math.round(n || 0).toLocaleString('es-CL');

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const isSameMonth = (iso: string | null | undefined, ref: Date) => {
  if (!iso) return false;
  const d = new Date(iso + 'T00:00:00');
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

export const monthLabel = (d: Date) =>
  `${MONTHS_ES[d.getMonth()][0].toUpperCase()}${MONTHS_ES[d.getMonth()].slice(1)} ${d.getFullYear()}`;

export const catMeta = (name: string) =>
  EXPENSE_CATEGORIES.find((c) => c.name === name) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
