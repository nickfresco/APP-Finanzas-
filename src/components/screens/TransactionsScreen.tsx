'use client';

import { useState } from 'react';
import { ArrowUpRight, Plus, Receipt, Repeat, Trash2 } from 'lucide-react';
import type { Theme } from '@/lib/theme';
import type { FinanceData, ModalState, TransactionType } from '@/types';
import { catMeta, fmt } from '@/lib/utils';
import { EmptyState, IconCircle, SegmentedControl } from '@/components/ui';

export function TransactionsScreen({
  theme, data, openModal, deleteTransaction,
}: {
  theme: Theme;
  data: FinanceData;
  now: Date;
  openModal: (m: ModalState) => void;
  deleteTransaction: (id: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const filtered = data.transactions
    .filter((t) => filter === 'all' || t.type === filter)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 style={{ color: theme.text }} className="text-[22px] font-bold">Movimientos</h1>
        <button
          onClick={() => openModal({ type: 'transaction', txType: 'expense' })}
          style={{ background: theme.accent }} className="text-white text-[13px] font-semibold px-3.5 py-2 rounded-full flex items-center gap-1"
        >
          <Plus size={14} /> Agregar
        </button>
      </div>
      <SegmentedControl
        theme={theme} value={filter} onChange={(v) => setFilter(v)}
        options={[{ value: 'all', label: 'Todos' }, { value: 'income', label: 'Ingresos' }, { value: 'expense', label: 'Gastos' }]}
      />
      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState theme={theme} icon={Receipt} text="No hay movimientos para mostrar." />
        ) : (
          <div style={{ background: theme.card, borderRadius: 18 }} className="overflow-hidden">
            {filtered.map((t, i) => {
              const meta = t.type === 'expense' ? catMeta(t.category) : { icon: ArrowUpRight, color: theme.green };
              return (
                <div key={t.id} style={{ borderTop: i > 0 ? `1px solid ${theme.border}` : 'none' }} className="flex items-center gap-3 p-3.5">
                  <IconCircle Icon={meta.icon} color={meta.color} />
                  <div className="flex-1 min-w-0">
                    <div style={{ color: theme.text }} className="text-[13.5px] font-medium truncate">{t.description || t.category}</div>
                    <div style={{ color: theme.textSecondary }} className="text-[11.5px] mt-0.5 flex items-center gap-1">
                      {t.category} · {new Date(t.date + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                      {t.recurring && <Repeat size={10} />}
                    </div>
                  </div>
                  <span className="num text-[14px] font-semibold" style={{ color: t.type === 'income' ? theme.green : theme.text }}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                  <button onClick={() => deleteTransaction(t.id)} className="ml-1 shrink-0">
                    <Trash2 size={14} style={{ color: theme.textSecondary }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
