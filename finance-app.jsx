import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Home, Receipt, CreditCard, PiggyBank, Target, Plus, X, TrendingUp, TrendingDown,
  Utensils, Car, Film, ShoppingBag, HeartPulse, Smartphone, Plane, GraduationCap,
  MoreHorizontal, Moon, Sun, Trash2, Wallet, Calendar, ChevronRight, Check, Pencil,
  ArrowUpRight, ArrowDownRight, Landmark, Repeat, ChevronLeft
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

/* ---------------------------------- Constants ---------------------------------- */

const STORAGE_KEY = 'nico-finance-data-v1';

const DEFAULT_DATA = {
  initialBalance: 0,
  transactions: [],
  fixedExpenses: [],
  installments: [],
  budgets: {},
  goals: [],
};

const EXPENSE_CATEGORIES = [
  { name: 'Comida', icon: Utensils, color: '#FF9F0A' },
  { name: 'Transporte', icon: Car, color: '#0A84FF' },
  { name: 'Entretención', icon: Film, color: '#BF5AF2' },
  { name: 'Compras', icon: ShoppingBag, color: '#FF375F' },
  { name: 'Hogar', icon: Home, color: '#30D158' },
  { name: 'Salud', icon: HeartPulse, color: '#FF453A' },
  { name: 'Tecnología', icon: Smartphone, color: '#64D2FF' },
  { name: 'Viajes', icon: Plane, color: '#5E5CE6' },
  { name: 'Educación', icon: GraduationCap, color: '#FFD60A' },
  { name: 'Otro', icon: MoreHorizontal, color: '#8E8E93' },
];

const INCOME_CATEGORIES = ['Sueldo', 'Freelance', 'Bono', 'Otro ingreso'];
const METHODS = ['Débito', 'Crédito', 'Efectivo', 'Transferencia'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const TABS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'transactions', label: 'Movimientos', icon: Receipt },
  { id: 'commitments', label: 'Compromisos', icon: CreditCard },
  { id: 'budget', label: 'Presupuesto', icon: PiggyBank },
  { id: 'goals', label: 'Metas', icon: Target },
];

/* ---------------------------------- Helpers ---------------------------------- */

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const fmt = (n) => '$' + Math.round(n || 0).toLocaleString('es-CL');
const todayISO = () => new Date().toISOString().slice(0, 10);
const isSameMonth = (iso, ref) => {
  if (!iso) return false;
  const d = new Date(iso + 'T00:00:00');
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};
const monthLabel = (d) => `${MONTHS_ES[d.getMonth()][0].toUpperCase()}${MONTHS_ES[d.getMonth()].slice(1)} ${d.getFullYear()}`;
const catMeta = (name) => EXPENSE_CATEGORIES.find((c) => c.name === name) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

function getTheme(dark) {
  return dark ? {
    bg: '#000000', card: '#1C1C1E', cardAlt: '#2A2A2C',
    text: '#F5F5F7', textSecondary: '#98989D', border: '#2C2C2E',
    accent: '#0A84FF', green: '#32D74B', red: '#FF453A', orange: '#FF9F0A', purple: '#BF5AF2',
    navBg: 'rgba(20,20,22,0.92)', overlay: 'rgba(0,0,0,0.65)',
  } : {
    bg: '#F2F2F7', card: '#FFFFFF', cardAlt: '#F2F2F7',
    text: '#1D1D1F', textSecondary: '#6E6E73', border: '#E5E5EA',
    accent: '#0A84FF', green: '#30D158', red: '#FF3B30', orange: '#FF9500', purple: '#AF52DE',
    navBg: 'rgba(255,255,255,0.92)', overlay: 'rgba(0,0,0,0.35)',
  };
}

/* ---------------------------------- Small UI pieces ---------------------------------- */

function StatCard({ label, value, theme, tone }) {
  const color = tone === 'green' ? theme.green : tone === 'red' ? theme.red : theme.text;
  return (
    <div style={{ background: theme.card, borderRadius: 18 }} className="p-3.5 flex-1 min-w-0">
      <div style={{ color: theme.textSecondary }} className="text-[12px] font-medium truncate">{label}</div>
      <div style={{ color }} className="num text-[17px] font-semibold mt-1 truncate">{fmt(value)}</div>
    </div>
  );
}

function ProgressBar({ pct, theme, color }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const barColor = color || (pct >= 100 ? theme.red : pct >= 80 ? theme.orange : theme.green);
  return (
    <div style={{ background: theme.cardAlt, height: 8, borderRadius: 999 }} className="w-full overflow-hidden">
      <div style={{ width: `${clamped}%`, background: barColor, height: '100%', borderRadius: 999, transition: 'width 0.4s ease' }} />
    </div>
  );
}

function SectionTitle({ children, theme, action }) {
  return (
    <div className="flex items-center justify-between mb-2.5 mt-6 first:mt-0">
      <h2 style={{ color: theme.text }} className="text-[15px] font-semibold">{children}</h2>
      {action}
    </div>
  );
}

function EmptyState({ theme, text, icon: Icon }) {
  return (
    <div style={{ background: theme.card, borderRadius: 18, color: theme.textSecondary }} className="p-8 flex flex-col items-center text-center gap-2">
      {Icon && <Icon size={26} style={{ color: theme.textSecondary }} />}
      <p className="text-[13px] leading-relaxed max-w-[220px]">{text}</p>
    </div>
  );
}

function IconCircle({ Icon, color, size = 38 }) {
  return (
    <div style={{ background: color + '22', width: size, height: size, borderRadius: size / 2 }} className="flex items-center justify-center shrink-0">
      <Icon size={size * 0.5} style={{ color }} strokeWidth={2.2} />
    </div>
  );
}

function SegmentedControl({ options, value, onChange, theme }) {
  return (
    <div style={{ background: theme.cardAlt, borderRadius: 12, padding: 3 }} className="flex w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, borderRadius: 9, padding: '7px 8px',
            background: value === opt.value ? theme.card : 'transparent',
            color: value === opt.value ? theme.text : theme.textSecondary,
            boxShadow: value === opt.value ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
          }}
          className="text-[13px] font-medium transition-all"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children, theme }) {
  return (
    <div className="mb-4">
      <label style={{ color: theme.textSecondary }} className="text-[12px] font-medium block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function inputStyle(theme) {
  return {
    background: theme.cardAlt, color: theme.text, borderRadius: 12,
    padding: '11px 13px', width: '100%', border: `1px solid ${theme.border}`, fontSize: 15,
  };
}

function Sheet({ title, onClose, theme, children }) {
  return (
    <div
      style={{ background: theme.overlay }}
      className="fixed inset-0 z-50 flex items-end justify-center fade-anim"
      onClick={onClose}
    >
      <div
        style={{ background: theme.bg, maxWidth: 480, maxHeight: '86vh' }}
        className="w-full rounded-t-[28px] sheet-anim overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ width: 30 }} />
          <h3 style={{ color: theme.text }} className="text-[15px] font-semibold">{title}</h3>
          <button onClick={onClose} style={{ background: theme.cardAlt }} className="w-7 h-7 rounded-full flex items-center justify-center">
            <X size={15} style={{ color: theme.textSecondary }} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, theme, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: disabled ? theme.textSecondary : theme.accent, opacity: disabled ? 0.5 : 1 }}
      className="w-full text-white font-semibold text-[15px] py-3.5 rounded-[14px] mt-2"
    >
      {children}
    </button>
  );
}

/* ---------------------------------- Forms ---------------------------------- */

function TransactionForm({ theme, initialType, onSave, onClose }) {
  const [type, setType] = useState(initialType || 'expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(initialType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0].name);
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState(METHODS[0]);
  const [recurring, setRecurring] = useState(false);

  const changeType = (t) => {
    setType(t);
    setCategory(t === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0].name);
  };

  const submit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onSave({ id: uid(), type, amount: amt, category, date, description: description.trim(), method, recurring });
  };

  return (
    <div>
      <Field label="Tipo" theme={theme}>
        <SegmentedControl
          theme={theme}
          value={type}
          onChange={changeType}
          options={[{ value: 'expense', label: 'Gasto' }, { value: 'income', label: 'Ingreso' }]}
        />
      </Field>
      <Field label="Monto" theme={theme}>
        <input
          type="number" inputMode="decimal" autoFocus placeholder="0"
          value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle(theme)}
        />
      </Field>
      <Field label="Categoría" theme={theme}>
        {type === 'expense' ? (
          <div className="grid grid-cols-5 gap-2">
            {EXPENSE_CATEGORIES.map((c) => (
              <button
                key={c.name} type="button" onClick={() => setCategory(c.name)}
                className="flex flex-col items-center gap-1"
              >
                <div style={{
                  background: category === c.name ? c.color : theme.cardAlt,
                  width: 42, height: 42, borderRadius: 21,
                }} className="flex items-center justify-center">
                  <c.icon size={19} style={{ color: category === c.name ? '#fff' : theme.textSecondary }} />
                </div>
                <span style={{ color: category === c.name ? theme.text : theme.textSecondary, fontSize: 10 }} className="text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {INCOME_CATEGORIES.map((c) => (
              <button
                key={c} type="button" onClick={() => setCategory(c)}
                style={{
                  background: category === c ? theme.accent : theme.cardAlt,
                  color: category === c ? '#fff' : theme.textSecondary,
                  borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 500,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </Field>
      <Field label="Fecha" theme={theme}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <Field label="Descripción (opcional)" theme={theme}>
        <input
          type="text" placeholder={type === 'expense' ? 'Ej: Almuerzo con el equipo' : 'Ej: Sueldo agosto'}
          value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle(theme)}
        />
      </Field>
      <Field label="Medio de pago" theme={theme}>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <button
              key={m} type="button" onClick={() => setMethod(m)}
              style={{
                background: method === m ? theme.accent : theme.cardAlt,
                color: method === m ? '#fff' : theme.textSecondary,
                borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 500,
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </Field>
      <button
        type="button" onClick={() => setRecurring(!recurring)}
        style={{ background: theme.card, borderRadius: 14, border: `1px solid ${theme.border}` }}
        className="w-full flex items-center justify-between p-3.5"
      >
        <div className="flex items-center gap-2.5">
          <Repeat size={16} style={{ color: theme.textSecondary }} />
          <div className="text-left">
            <div style={{ color: theme.text }} className="text-[13px] font-medium">Se repite cada mes</div>
            <div style={{ color: theme.textSecondary }} className="text-[11px]">Se contará automáticamente todos los meses</div>
          </div>
        </div>
        <div style={{ background: recurring ? theme.accent : theme.cardAlt, width: 40, height: 24, borderRadius: 12 }} className="relative shrink-0">
          <div style={{ background: '#fff', width: 18, height: 18, borderRadius: 9, position: 'absolute', top: 3, left: recurring ? 19 : 3, transition: 'left 0.2s' }} />
        </div>
      </button>
      <PrimaryButton theme={theme} onClick={submit} disabled={!amount || parseFloat(amount) <= 0}>
        Guardar {type === 'expense' ? 'gasto' : 'ingreso'}
      </PrimaryButton>
    </div>
  );
}

function FixedExpenseForm({ theme, onSave, onClose }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [paymentDay, setPaymentDay] = useState('1');
  const [method, setMethod] = useState(METHODS[0]);
  const [endDate, setEndDate] = useState('');

  const submit = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || !amt || amt <= 0) return;
    onSave({ id: uid(), name: name.trim(), amount: amt, category, paymentDay: parseInt(paymentDay) || 1, method, startDate: todayISO(), endDate: endDate || null });
  };

  return (
    <div>
      <Field label="Nombre" theme={theme}>
        <input type="text" placeholder="Ej: Arriendo" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle(theme)} autoFocus />
      </Field>
      <Field label="Monto mensual" theme={theme}>
        <input type="number" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <Field label="Categoría" theme={theme}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle(theme)}>
          {EXPENSE_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Día de pago (1-31)" theme={theme}>
        <input type="number" min="1" max="31" value={paymentDay} onChange={(e) => setPaymentDay(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <Field label="Medio de pago" theme={theme}>
        <select value={method} onChange={(e) => setMethod(e.target.value)} style={inputStyle(theme)}>
          {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Fecha de término (opcional)" theme={theme}>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <PrimaryButton theme={theme} onClick={submit} disabled={!name.trim() || !amount}>Guardar gasto fijo</PrimaryButton>
    </div>
  );
}

function InstallmentForm({ theme, onSave, onClose }) {
  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [num, setNum] = useState('');
  const [paid, setPaid] = useState('0');

  const monthly = (parseFloat(total) || 0) / (parseInt(num) || 1);

  const submit = () => {
    const t = parseFloat(total), n = parseInt(num);
    if (!name.trim() || !t || t <= 0 || !n || n <= 0) return;
    onSave({ id: uid(), name: name.trim(), totalAmount: t, numInstallments: n, paidInstallments: Math.min(parseInt(paid) || 0, n), startDate: todayISO() });
  };

  return (
    <div>
      <Field label="Nombre" theme={theme}>
        <input type="text" placeholder="Ej: Televisor" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle(theme)} autoFocus />
      </Field>
      <Field label="Precio total" theme={theme}>
        <input type="number" inputMode="decimal" placeholder="0" value={total} onChange={(e) => setTotal(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <Field label="Número de cuotas" theme={theme}>
        <input type="number" placeholder="0" value={num} onChange={(e) => setNum(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <Field label="Cuotas ya pagadas" theme={theme}>
        <input type="number" min="0" value={paid} onChange={(e) => setPaid(e.target.value)} style={inputStyle(theme)} />
      </Field>
      {!!(total && num) && (
        <div style={{ background: theme.cardAlt, borderRadius: 12 }} className="p-3 mb-3 text-[13px]" >
          <span style={{ color: theme.textSecondary }}>Cuota mensual: </span>
          <span style={{ color: theme.text }} className="font-semibold num">{fmt(monthly)}</span>
        </div>
      )}
      <PrimaryButton theme={theme} onClick={submit} disabled={!name.trim() || !total || !num}>Guardar cuota</PrimaryButton>
    </div>
  );
}

function GoalForm({ theme, onSave, onClose }) {
  const [name, setName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [saved, setSaved] = useState('0');
  const [targetDate, setTargetDate] = useState('');

  const submit = () => {
    const g = parseFloat(goalAmount);
    if (!name.trim() || !g || g <= 0) return;
    onSave({ id: uid(), name: name.trim(), goalAmount: g, saved: parseFloat(saved) || 0, targetDate: targetDate || null });
  };

  return (
    <div>
      <Field label="Nombre de la meta" theme={theme}>
        <input type="text" placeholder="Ej: Viaje al sur" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle(theme)} autoFocus />
      </Field>
      <Field label="Monto objetivo" theme={theme}>
        <input type="number" inputMode="decimal" placeholder="0" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <Field label="Ya ahorrado (opcional)" theme={theme}>
        <input type="number" inputMode="decimal" value={saved} onChange={(e) => setSaved(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <Field label="Fecha objetivo (opcional)" theme={theme}>
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <PrimaryButton theme={theme} onClick={submit} disabled={!name.trim() || !goalAmount}>Crear meta</PrimaryButton>
    </div>
  );
}

function AmountForm({ theme, label, submitLabel, initial, onSave }) {
  const [val, setVal] = useState(initial ? String(initial) : '');
  return (
    <div>
      <Field label={label} theme={theme}>
        <input type="number" inputMode="decimal" autoFocus placeholder="0" value={val} onChange={(e) => setVal(e.target.value)} style={inputStyle(theme)} />
      </Field>
      <PrimaryButton theme={theme} onClick={() => onSave(parseFloat(val) || 0)} disabled={val === ''}>{submitLabel}</PrimaryButton>
    </div>
  );
}

/* ---------------------------------- Screens ---------------------------------- */

function HomeScreen({ theme, data, now, computed, openModal, setTab }) {
  const { monthIncome, totalExpenses, estimatedSavings, available, fixedTotal, installmentMonthly, chartData, healthMsg, healthTone, weekIncome, weekExpense, weekCategoryRows } = computed;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const isEmpty = data.transactions.length === 0 && data.fixedExpenses.length === 0 && data.installments.length === 0;

  return (
    <div>
      <div style={{ color: theme.textSecondary }} className="text-[13px] font-medium">{monthLabel(now)}</div>
      <h1 style={{ color: theme.text }} className="text-[22px] font-bold mt-0.5 mb-4">{greeting}, Nicolás 👋</h1>

      {/* Hero wallet card */}
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

      {/* Stat row */}
      <div className="flex gap-2.5 mt-3">
        <StatCard theme={theme} label="Ingresos" value={monthIncome} tone="green" />
        <StatCard theme={theme} label="Gastos" value={totalExpenses} tone="red" />
        <StatCard theme={theme} label="Ahorro est." value={estimatedSavings} tone={estimatedSavings >= 0 ? 'green' : 'red'} />
      </div>

      {/* Financial health */}
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

      {/* Chart */}
      {!isEmpty && (
        <>
          <SectionTitle theme={theme}>Ingresos vs. gastos</SectionTitle>
          <div style={{ background: theme.card, borderRadius: 18 }} className="p-4 pb-1">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barGap={4}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: theme.textSecondary, fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => fmt(v)}
                  contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: theme.text }}
                  cursor={{ fill: theme.cardAlt }}
                />
                <Bar dataKey="ingresos" fill={theme.green} radius={[5, 5, 0, 0]} maxBarSize={22} name="Ingresos" />
                <Bar dataKey="gastos" fill={theme.red} radius={[5, 5, 0, 0]} maxBarSize={22} name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Week summary */}
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

      {/* Commitments summary */}
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

function TransactionsScreen({ theme, data, now, openModal, deleteTransaction }) {
  const [filter, setFilter] = useState('all');
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
        theme={theme} value={filter} onChange={setFilter}
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

function CommitmentsScreen({ theme, data, computed, openModal, deleteFixed, deleteInstallment, payInstallment }) {
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

function BudgetScreen({ theme, data, computed, openModal, setBudget }) {
  const { spentByCategory, monthVariableExpense } = computed;
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

function GoalsScreen({ theme, data, openModal, deleteGoal }) {
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
            let monthlyNeeded = null;
            if (g.targetDate) {
              const now = new Date();
              const target = new Date(g.targetDate + 'T00:00:00');
              const months = Math.max(1, Math.round((target - now) / (1000 * 60 * 60 * 24 * 30)));
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

/* ---------------------------------- App ---------------------------------- */

export default function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState('home');
  const [modal, setModal] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const theme = getTheme(dark);
  const now = new Date();

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) setData({ ...DEFAULT_DATA, ...JSON.parse(res.value) });
      } catch (e) {
        /* sin datos guardados aún */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setData(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
    } catch (e) {
      console.error('No se pudo guardar', e);
    }
  }, []);

  const openModal = (m) => setModal(m);
  const closeModal = () => setModal(null);

  const addTransaction = (t) => { persist({ ...data, transactions: [...data.transactions, t] }); closeModal(); };
  const deleteTransaction = (id) => persist({ ...data, transactions: data.transactions.filter((t) => t.id !== id) });
  const addFixed = (f) => { persist({ ...data, fixedExpenses: [...data.fixedExpenses, f] }); closeModal(); };
  const deleteFixed = (id) => persist({ ...data, fixedExpenses: data.fixedExpenses.filter((f) => f.id !== id) });
  const addInstallment = (ins) => { persist({ ...data, installments: [...data.installments, ins] }); closeModal(); };
  const deleteInstallment = (id) => persist({ ...data, installments: data.installments.filter((i) => i.id !== id) });
  const payInstallment = (id) => persist({ ...data, installments: data.installments.map((i) => i.id === id ? { ...i, paidInstallments: Math.min(i.numInstallments, i.paidInstallments + 1) } : i) });
  const addGoal = (g) => { persist({ ...data, goals: [...data.goals, g] }); closeModal(); };
  const deleteGoal = (id) => persist({ ...data, goals: data.goals.filter((g) => g.id !== id) });
  const contributeGoal = (id, amt) => { persist({ ...data, goals: data.goals.map((g) => g.id === id ? { ...g, saved: g.saved + amt } : g) }); closeModal(); };
  const setBudget = (cat, amt) => { persist({ ...data, budgets: { ...data.budgets, [cat]: amt } }); closeModal(); };
  const setBalance = (amt) => { persist({ ...data, initialBalance: amt }); closeModal(); };

  const computed = useMemo(() => {
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

    const spentByCategory = {};
    data.transactions.filter((t) => t.type === 'expense' && isSameMonth(t.date, now)).forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
    });

    const chartData = [
      { week: 'Sem 1', ingresos: 0, gastos: 0 },
      { week: 'Sem 2', ingresos: 0, gastos: 0 },
      { week: 'Sem 3', ingresos: 0, gastos: 0 },
      { week: 'Sem 4', ingresos: 0, gastos: 0 },
    ];
    data.transactions.forEach((t) => {
      if (!isSameMonth(t.date, now)) return;
      const day = new Date(t.date + 'T00:00:00').getDate();
      const idx = Math.min(3, Math.floor((day - 1) / 7));
      if (t.type === 'income') chartData[idx].ingresos += t.amount; else chartData[idx].gastos += t.amount;
    });

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const prevMonthVariable = data.transactions.filter((t) => t.type === 'expense' && isSameMonth(t.date, prevMonthDate)).reduce((s, t) => s + t.amount, 0);
    const currMonthVariable = data.transactions.filter((t) => t.type === 'expense' && isSameMonth(t.date, now)).reduce((s, t) => s + t.amount, 0);
    let healthMsg, healthTone;
    if (prevMonthVariable <= 0) {
      healthMsg = 'Sigue registrando tus movimientos — con más historial podremos comparar tus meses.';
      healthTone = 'neutral';
    } else {
      const pct = Math.round(((currMonthVariable - prevMonthVariable) / prevMonthVariable) * 100);
      if (pct <= -5) { healthMsg = `Vas bien. Tus gastos variables son ${Math.abs(pct)}% más bajos que el mes pasado.`; healthTone = 'green'; }
      else if (pct >= 15) { healthMsg = `Tus gastos variables están ${pct}% por sobre el mes pasado.`; healthTone = 'red'; }
      else { healthMsg = `Tus gastos variables se mantienen estables respecto al mes pasado (${pct >= 0 ? '+' : ''}${pct}%).`; healthTone = 'neutral'; }
    }

    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 6);
    const weekTx = data.transactions.filter((t) => { const d = new Date(t.date + 'T00:00:00'); return d >= weekAgo && d <= now; });
    const weekIncome = weekTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const weekExpense = weekTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const weekByCat = {};
    weekTx.filter((t) => t.type === 'expense').forEach((t) => { weekByCat[t.category] = (weekByCat[t.category] || 0) + t.amount; });
    const weekCategoryRows = Object.entries(weekByCat).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([cat, amt]) => ({ cat, amt, pct: weekExpense ? Math.round((amt / weekExpense) * 100) : 0 }));

    return { monthIncome, monthVariableExpense, fixedTotal, installmentMonthly, totalExpenses, estimatedSavings, available, spentByCategory, chartData, healthMsg, healthTone, weekIncome, weekExpense, weekCategoryRows };
  }, [data, now.getDate()]);

  if (!loaded) {
    return (
      <div style={{ background: theme.bg, minHeight: 480 }} className="flex items-center justify-center">
        <div style={{ color: theme.textSecondary }} className="text-[13px]">Cargando…</div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }} className="min-h-[600px] w-full relative">
      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        .num { font-variant-numeric: tabular-nums; }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .sheet-anim { animation: sheetUp 0.28s cubic-bezier(0.32,0.72,0,1); }
        .fade-anim { animation: fadeIn 0.18s ease-out; }
        select { appearance: none; -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        button { cursor: pointer; }
        input:focus, select:focus { outline: none; border-color: ${theme.accent}; }
      `}</style>

      <div className="flex">
        {/* Desktop sidebar */}
        <div style={{ borderRight: `1px solid ${theme.border}` }} className="hidden md:flex md:flex-col w-56 shrink-0 min-h-[600px] p-4">
          <div style={{ color: theme.text }} className="text-[16px] font-bold px-2 mb-6 mt-1">💰 Mis Finanzas</div>
          {TABS.map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              style={{ background: tab === t.id ? theme.card : 'transparent', color: tab === t.id ? theme.text : theme.textSecondary }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] mb-1 text-[13.5px] font-medium"
            >
              <t.icon size={17} />{t.label}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => setDark(!dark)} style={{ color: theme.textSecondary }} className="flex items-center gap-2.5 px-3 py-2.5 text-[13px]">
            {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-end p-3 md:hidden">
            <button onClick={() => setDark(!dark)} style={{ background: theme.card }} className="w-8 h-8 rounded-full flex items-center justify-center">
              {dark ? <Sun size={15} style={{ color: theme.text }} /> : <Moon size={15} style={{ color: theme.text }} />}
            </button>
          </div>
          <div className="max-w-[560px] mx-auto px-4 pb-28 md:pb-10 md:pt-6">
            {tab === 'home' && <HomeScreen theme={theme} data={data} now={now} computed={computed} openModal={openModal} setTab={setTab} />}
            {tab === 'transactions' && <TransactionsScreen theme={theme} data={data} now={now} openModal={openModal} deleteTransaction={deleteTransaction} />}
            {tab === 'commitments' && <CommitmentsScreen theme={theme} data={data} computed={computed} openModal={openModal} deleteFixed={deleteFixed} deleteInstallment={deleteInstallment} payInstallment={payInstallment} />}
            {tab === 'budget' && <BudgetScreen theme={theme} data={data} computed={computed} openModal={openModal} setBudget={setBudget} />}
            {tab === 'goals' && <GoalsScreen theme={theme} data={data} openModal={openModal} deleteGoal={deleteGoal} />}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div style={{ background: theme.navBg, borderTop: `1px solid ${theme.border}`, backdropFilter: 'blur(20px)' }} className="fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] z-40">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-1 px-2">
            <t.icon size={21} style={{ color: tab === t.id ? theme.accent : theme.textSecondary }} strokeWidth={tab === t.id ? 2.4 : 2} />
            <span style={{ color: tab === t.id ? theme.accent : theme.textSecondary }} className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        style={{ background: theme.accent, boxShadow: '0 6px 18px rgba(10,132,255,0.4)' }}
        className="fixed right-5 bottom-[86px] md:bottom-8 w-14 h-14 rounded-full flex items-center justify-center z-40"
      >
        <Plus size={26} color="#fff" strokeWidth={2.4} />
      </button>

      {/* Action sheet for FAB */}
      {sheetOpen && (
        <Sheet title="Agregar" theme={theme} onClose={() => setSheetOpen(false)}>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Gasto', icon: ArrowDownRight, color: theme.red, action: () => { setSheetOpen(false); openModal({ type: 'transaction', txType: 'expense' }); } },
              { label: 'Ingreso', icon: ArrowUpRight, color: theme.green, action: () => { setSheetOpen(false); openModal({ type: 'transaction', txType: 'income' }); } },
              { label: 'Cuota nueva', icon: CreditCard, color: theme.accent, action: () => { setSheetOpen(false); openModal({ type: 'installment' }); } },
              { label: 'Meta de ahorro', icon: Target, color: theme.purple, action: () => { setSheetOpen(false); openModal({ type: 'goal' }); } },
            ].map((opt) => (
              <button key={opt.label} onClick={opt.action} style={{ background: theme.card, border: `1px solid ${theme.border}` }} className="flex items-center gap-3 p-3.5 rounded-[14px]">
                <IconCircle Icon={opt.icon} color={opt.color} />
                <span style={{ color: theme.text }} className="text-[14px] font-medium">{opt.label}</span>
                <ChevronRight size={16} style={{ color: theme.textSecondary }} className="ml-auto" />
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {/* Modals */}
      {modal && modal.type === 'transaction' && (
        <Sheet title={modal.txType === 'income' ? 'Nuevo ingreso' : 'Nuevo gasto'} theme={theme} onClose={closeModal}>
          <TransactionForm theme={theme} initialType={modal.txType} onSave={addTransaction} onClose={closeModal} />
        </Sheet>
      )}
      {modal && modal.type === 'fixed' && (
        <Sheet title="Nuevo gasto fijo" theme={theme} onClose={closeModal}>
          <FixedExpenseForm theme={theme} onSave={addFixed} onClose={closeModal} />
        </Sheet>
      )}
      {modal && modal.type === 'installment' && (
        <Sheet title="Nueva cuota" theme={theme} onClose={closeModal}>
          <InstallmentForm theme={theme} onSave={addInstallment} onClose={closeModal} />
        </Sheet>
      )}
      {modal && modal.type === 'goal' && (
        <Sheet title="Nueva meta" theme={theme} onClose={closeModal}>
          <GoalForm theme={theme} onSave={addGoal} onClose={closeModal} />
        </Sheet>
      )}
      {modal && modal.type === 'contribute' && (
        <Sheet title="Abonar a la meta" theme={theme} onClose={closeModal}>
          <AmountForm theme={theme} label="Monto a abonar" submitLabel="Abonar" onSave={(amt) => contributeGoal(modal.goalId, amt)} />
        </Sheet>
      )}
      {modal && modal.type === 'budget' && (
        <Sheet title={`Presupuesto · ${modal.category}`} theme={theme} onClose={closeModal}>
          <AmountForm theme={theme} label="Monto mensual" submitLabel="Guardar" initial={data.budgets[modal.category]} onSave={(amt) => setBudget(modal.category, amt)} />
        </Sheet>
      )}
      {modal && modal.type === 'balance' && (
        <Sheet title="Editar saldo base" theme={theme} onClose={closeModal}>
          <p style={{ color: theme.textSecondary }} className="text-[12.5px] mb-3">Es el monto base sobre el que se calcula tu disponible, sumando tus ingresos y restando tus gastos de este mes.</p>
          <AmountForm theme={theme} label="Saldo base" submitLabel="Guardar" initial={data.initialBalance} onSave={setBalance} />
        </Sheet>
      )}
    </div>
  );
}
