import { CreditCard, Landmark, Plus, Trash2 } from 'lucide-react';
import type { Theme } from '@/lib/theme';
import type { FinanceData, ModalState } from '@/types';
import type { ComputedFinance } from '@/lib/computations';
import { catMeta, fmt } from '@/lib/utils';
import { EmptyState, IconCircle, ProgressBar, SectionTitle } from '@/components/ui';

export function CommitmentsScreen({
  theme, data, computed, openModal, deleteFixed, deleteInstallment, payInstallment,
}: {
  theme: Theme;
  data: FinanceData;
  computed: ComputedFinance;
  openModal: (m: ModalState) => void;
  deleteFixed: (id: string) => void;
  deleteInstallment: (id: string) => void;
  payInstallment: (id: string) => void;
}) {
  const { fixedTotal, installmentMonthly, monthIncome } = computed;
  return (
    <div>
      <h1 style={{ color: theme.text }} className="text-[22px] font-bold mb-1">Compromisos</h1>
      <p style={{ color: theme.textSecondary }} className="text-[13px] mb-4">Gastos fijos y cuotas que comprometen tu ingreso futuro.</p>

      <div style={{ background: theme.card, borderRadius: 18 }} className="p-4 flex items-center justify-between">
        <div>
          <div style={{ color: theme.textSecondary }} className="text-[12px]">Compromisos mensuales totales</div>
          <div style={{ color: theme.text }} className="num text-[19px] font-bold mt-0.5">{fmt(fixedTotal + installmentMonthly)}</div>
        </div>
        <div style={{ color: theme.textSecondary }} className="text-[12px] text-right">
          {monthIncome > 0 ? `${Math.round((fixedTotal + installmentMonthly) / monthIncome * 100)}%` : '—'}<br />del ingreso
        </div>
      </div>

      <SectionTitle theme={theme} action={
        <button onClick={() => openModal({ type: 'fixed' })} style={{ color: theme.accent }} className="text-[12.5px] font-medium flex items-center gap-0.5"><Plus size={13} /> Agregar</button>
      }>Gastos fijos · {fmt(fixedTotal)}{monthIncome > 0 ? ` (${Math.round(fixedTotal / monthIncome * 100)}% del ingreso)` : ''}</SectionTitle>
      {data.fixedExpenses.length === 0 ? (
        <EmptyState theme={theme} icon={Landmark} text="Agrega tus gastos fijos: arriendo, internet, seguros, streaming..." />
      ) : (
        <div style={{ background: theme.card, borderRadius: 18 }} className="overflow-hidden">
          {data.fixedExpenses.map((f, i) => {
            const meta = catMeta(f.category);
            return (
              <div key={f.id} style={{ borderTop: i > 0 ? `1px solid ${theme.border}` : 'none' }} className="flex items-center gap-3 p-3.5">
                <IconCircle Icon={meta.icon} color={meta.color} />
                <div className="flex-1 min-w-0">
                  <div style={{ color: theme.text }} className="text-[13.5px] font-medium truncate">{f.name}</div>
                  <div style={{ color: theme.textSecondary }} className="text-[11.5px] mt-0.5">Día {f.paymentDay} · {f.method}</div>
                </div>
                <span className="num text-[14px] font-semibold" style={{ color: theme.text }}>{fmt(f.amount)}</span>
                <button onClick={() => deleteFixed(f.id)} className="ml-1 shrink-0"><Trash2 size={14} style={{ color: theme.textSecondary }} /></button>
              </div>
            );
          })}
        </div>
      )}

      <SectionTitle theme={theme} action={
        <button onClick={() => openModal({ type: 'installment' })} style={{ color: theme.accent }} className="text-[12.5px] font-medium flex items-center gap-0.5"><Plus size={13} /> Agregar</button>
      }>Cuotas · {fmt(installmentMonthly)}/mes</SectionTitle>
      {data.installments.length === 0 ? (
        <EmptyState theme={theme} icon={CreditCard} text="Registra tus compras en cuotas para ver cuánto tienes comprometido." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.installments.map((ins) => {
            const monthly = ins.totalAmount / ins.numInstallments;
            const remaining = ins.totalAmount - monthly * ins.paidInstallments;
            const pct = Math.round((ins.paidInstallments / ins.numInstallments) * 100);
            const start = new Date(ins.startDate + 'T00:00:00');
            const end = new Date(start.getFullYear(), start.getMonth() + ins.numInstallments, start.getDate());
            const done = ins.paidInstallments >= ins.numInstallments;
            return (
              <div key={ins.id} style={{ background: theme.card, borderRadius: 18 }} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div style={{ color: theme.text }} className="text-[14px] font-semibold">{ins.name}</div>
                    <div style={{ color: theme.textSecondary }} className="text-[11.5px] mt-0.5">{ins.paidInstallments}/{ins.numInstallments} pagadas · {fmt(monthly)}/mes</div>
                  </div>
                  <button onClick={() => deleteInstallment(ins.id)}><Trash2 size={14} style={{ color: theme.textSecondary }} /></button>
                </div>
                <ProgressBar theme={theme} pct={pct} color={theme.accent} />
                <div className="flex items-center justify-between mt-2">
                  <span style={{ color: theme.textSecondary }} className="text-[11.5px]">Saldo {fmt(Math.max(0, remaining))} · Fin {end.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}</span>
                  {!done && (
                    <button onClick={() => payInstallment(ins.id)} style={{ color: theme.accent }} className="text-[12px] font-semibold">Marcar cuota pagada</button>
                  )}
                  {done && <span style={{ color: theme.green }} className="text-[12px] font-semibold">Pagada ✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
