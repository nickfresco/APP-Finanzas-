import { Pencil } from 'lucide-react';
import type { Theme } from '@/lib/theme';
import type { FinanceData, ModalState } from '@/types';
import type { ComputedFinance } from '@/lib/computations';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { fmt } from '@/lib/utils';
import { IconCircle, ProgressBar } from '@/components/ui';

export function BudgetScreen({
  theme, data, computed, openModal,
}: {
  theme: Theme;
  data: FinanceData;
  computed: ComputedFinance;
  openModal: (m: ModalState) => void;
}) {
  const { spentByCategory } = computed;
  return (
    <div>
      <h1 style={{ color: theme.text }} className="text-[22px] font-bold mb-1">Presupuesto</h1>
      <p style={{ color: theme.textSecondary }} className="text-[13px] mb-4">Define un límite mensual por categoría y sigue tu avance.</p>
      <div style={{ background: theme.card, borderRadius: 18 }} className="overflow-hidden">
        {EXPENSE_CATEGORIES.map((c, i) => {
          const spent = spentByCategory[c.name] || 0;
          const budget = data.budgets[c.name] || 0;
          const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
          return (
            <div key={c.name} style={{ borderTop: i > 0 ? `1px solid ${theme.border}` : 'none' }} className="p-3.5">
              <div className="flex items-center gap-2.5 mb-2">
                <IconCircle Icon={c.icon} color={c.color} size={32} />
                <div className="flex-1 min-w-0">
                  <div style={{ color: theme.text }} className="text-[13.5px] font-medium">{c.name}</div>
                  {budget > 0 ? (
                    <div style={{ color: theme.textSecondary }} className="text-[11.5px] num">{fmt(spent)} / {fmt(budget)}</div>
                  ) : (
                    <div style={{ color: theme.textSecondary }} className="text-[11.5px] num">Gastado: {fmt(spent)}</div>
                  )}
                </div>
                <button onClick={() => openModal({ type: 'budget', category: c.name })} style={{ color: theme.accent }} className="text-[12px] font-medium flex items-center gap-0.5">
                  <Pencil size={11} /> {budget > 0 ? 'Editar' : 'Definir'}
                </button>
              </div>
              {budget > 0 && <ProgressBar theme={theme} pct={pct} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
