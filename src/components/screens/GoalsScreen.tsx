import { Plus, Target, Trash2 } from 'lucide-react';
import type { Theme } from '@/lib/theme';
import type { FinanceData, ModalState } from '@/types';
import { fmt } from '@/lib/utils';
import { EmptyState, ProgressBar } from '@/components/ui';

export function GoalsScreen({
  theme, data, openModal, deleteGoal,
}: {
  theme: Theme;
  data: FinanceData;
  openModal: (m: ModalState) => void;
  deleteGoal: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 style={{ color: theme.text }} className="text-[22px] font-bold">Metas de ahorro</h1>
        <button onClick={() => openModal({ type: 'goal' })} style={{ background: theme.accent }} className="text-white text-[13px] font-semibold px-3.5 py-2 rounded-full flex items-center gap-1">
          <Plus size={14} /> Nueva
        </button>
      </div>
      {data.goals.length === 0 ? (
        <EmptyState theme={theme} icon={Target} text="Crea tu primera meta de ahorro, como un viaje o un fondo de emergencia." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.goals.map((g) => {
            const pct = Math.min(100, Math.round((g.saved / g.goalAmount) * 100));
            const remaining = Math.max(0, g.goalAmount - g.saved);
            let monthlyNeeded: number | null = null;
            if (g.targetDate) {
              const now = new Date();
              const target = new Date(g.targetDate + 'T00:00:00');
              const months = Math.max(1, Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
              monthlyNeeded = remaining / months;
            }
            return (
              <div key={g.id} style={{ background: theme.card, borderRadius: 18 }} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div style={{ color: theme.text }} className="text-[14.5px] font-semibold">{g.name}</div>
                    <div style={{ color: theme.textSecondary }} className="text-[11.5px] mt-0.5 num">{fmt(g.saved)} de {fmt(g.goalAmount)}</div>
                  </div>
                  <button onClick={() => deleteGoal(g.id)}><Trash2 size={14} style={{ color: theme.textSecondary }} /></button>
                </div>
                <ProgressBar theme={theme} pct={pct} color={theme.purple} />
                <div className="flex items-center justify-between mt-2.5">
                  <span style={{ color: theme.textSecondary }} className="text-[11.5px]">
                    {pct}% · Faltan {fmt(remaining)}
                    {monthlyNeeded !== null && ` · ${fmt(monthlyNeeded)}/mes`}
                  </span>
                  <button onClick={() => openModal({ type: 'contribute', goalId: g.id })} style={{ color: theme.accent }} className="text-[12px] font-semibold">+ Abonar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
