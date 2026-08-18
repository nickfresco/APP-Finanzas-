import { Check, Landmark, TrendingDown, TrendingUp, Wallet, ChevronRight, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Theme } from '@/lib/theme';
import type { FinanceData, ModalState } from '@/types';
import type { ComputedFinance } from '@/lib/computations';
import type { TabDef } from '@/lib/constants';
import { fmt, monthLabel, catMeta } from '@/lib/utils';
import { StatCard, SectionTitle, EmptyState } from '@/components/ui';

export function HomeScreen({
  theme, data, now, computed, openModal, setTab,
}: {
  theme: Theme;
  data: FinanceData;
  now: Date;
  computed: ComputedFinance;
  openModal: (m: ModalState) => void;
  setTab: (id: TabDef['id']) => void;
}) {
  const {
    monthIncome, totalExpenses, estimatedSavings, available, fixedTotal, installmentMonthly,
    chartData, healthMsg, healthTone, weekIncome, weekExpense, weekCategoryRows,
  } = computed;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const isEmpty = data.transactions.length === 0 && data.fixedExpenses.length === 0 && data.installments.length === 0;

  return (
    <div>
      <div style={{ color: theme.textSecondary }} className="text-[13px] font-medium">{monthLabel(now)}</div>
      <h1 style={{ color: theme.text }} className="text-[22px] font-bold mt-0.5 mb-4">{greeting}, Nicolás 👋</h1>

      <div
        onClick={() => openModal({ type: 'balance' })}
        style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #123A6B 45%, #2E4FA3 100%)',
          borderRadius: 24, padding: 20, position: 'relative', overflow: 'hidden', cursor: 'pointer',
        }}
      >
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)',
        }} />
        <div className="flex items-center justify-between relative">
          <span style={{ color: 'rgba(255,255,255,0.7)' }} className="text-[12px] font-medium">Disponible</span>
          <Wallet size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </div>
        <div className="num text-white text-[30px] font-bold mt-1.5 relative">{fmt(available)}</div>
        <div style={{ color: 'rgba(255,255,255,0.55)' }} className="text-[11px] mt-1 relative">Saldo base {fmt(data.initialBalance)} · Toca para editar</div>
      </div>

      <div className="flex gap-2.5 mt-3">
        <StatCard theme={theme} label="Ingresos" value={monthIncome} tone="green" />
        <StatCard theme={theme} label="Gastos" value={totalExpenses} tone="red" />
        <StatCard theme={theme} label="Ahorro est." value={estimatedSavings} tone={estimatedSavings >= 0 ? 'green' : 'red'} />
      </div>

      <div style={{ background: theme.card, borderRadius: 18 }} className="p-4 mt-3 flex items-start gap-3">
        <div style={{
          background: healthTone === 'green' ? theme.green + '22' : healthTone === 'red' ? theme.red + '22' : theme.cardAlt,
          width: 34, height: 34, borderRadius: 17,
        }} className="flex items-center justify-center shrink-0">
          {healthTone === 'green' ? <TrendingDown size={16} style={{ color: theme.green }} /> : healthTone === 'red' ? <TrendingUp size={16} style={{ color: theme.red }} /> : <Check size={16} style={{ color: theme.textSecondary }} />}
        </div>
        <p style={{ color: theme.text }} className="text-[13px] leading-relaxed pt-1.5">{healthMsg}</p>
      </div>

      {isEmpty && (
        <div className="mt-3">
          <EmptyState theme={theme} icon={Receipt} text="Aún no tienes movimientos. Toca el botón + para registrar tu primer ingreso o gasto." />
        </div>
      )}

      {!isEmpty && (
        <>
          <SectionTitle theme={theme}>Ingresos vs. gastos</SectionTitle>
          <div style={{ background: theme.card, borderRadius: 18 }} className="p-4 pb-1">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barGap={4}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: theme.textSecondary, fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => fmt(Number(v))}
                  contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: theme.text }}
                  cursor={{ fill: theme.cardAlt }}
                />
                <Bar dataKey="ingresos" fill={theme.green} radius={[5, 5, 0, 0]} maxBarSize={22} name="Ingresos" />
                <Bar dataKey="gastos" fill={theme.red} radius={[5, 5, 0, 0]} maxBarSize={22} name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SectionTitle theme={theme}>Esta semana</SectionTitle>
          <div style={{ background: theme.card, borderRadius: 18 }} className="p-4">
            <div className="flex justify-between text-[13px] mb-3">
              <span style={{ color: theme.textSecondary }}>Ingresos <span style={{ color: theme.green }} className="font-semibold num">{fmt(weekIncome)}</span></span>
              <span style={{ color: theme.textSecondary }}>Gastos <span style={{ color: theme.red }} className="font-semibold num">{fmt(weekExpense)}</span></span>
            </div>
            {weekCategoryRows.length === 0 ? (
              <p style={{ color: theme.textSecondary }} className="text-[12px]">Sin gastos registrados esta semana.</p>
            ) : weekCategoryRows.map((r) => {
              const meta = catMeta(r.cat);
              return (
                <div key={r.cat} className="flex items-center gap-2.5 py-1.5">
                  <meta.icon size={14} style={{ color: meta.color }} />
                  <span style={{ color: theme.text }} className="text-[12.5px] flex-1">{r.cat}</span>
                  <span style={{ color: theme.textSecondary }} className="text-[12px]">{r.pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <SectionTitle theme={theme} action={
        <button onClick={() => setTab('commitments')} style={{ color: theme.accent }} className="text-[12.5px] font-medium flex items-center">Ver todo <ChevronRight size={14} /></button>
      }>Compromisos mensuales</SectionTitle>
      <div style={{ background: theme.card, borderRadius: 18 }} className="p-4 flex items-center justify-between">
        <div>
          <div style={{ color: theme.text }} className="num text-[17px] font-semibold">{fmt(fixedTotal + installmentMonthly)}</div>
          <div style={{ color: theme.textSecondary }} className="text-[12px] mt-0.5">
            {monthIncome > 0 ? `${Math.round((fixedTotal + installmentMonthly) / monthIncome * 100)}% de tu ingreso mensual` : 'Gastos fijos + cuotas'}
          </div>
        </div>
        <Landmark size={22} style={{ color: theme.textSecondary }} />
      </div>
    </div>
  );
}
