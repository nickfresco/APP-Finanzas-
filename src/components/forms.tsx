'use client';

import { useState } from 'react';
import { Repeat } from 'lucide-react';
import type { Theme } from '@/lib/theme';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, METHODS } from '@/lib/constants';
import { fmt, todayISO } from '@/lib/utils';
import type { NewFixedExpense, NewGoal, NewInstallment, NewTransaction, TransactionType } from '@/types';
import { Field, PrimaryButton, SegmentedControl, inputStyle } from '@/components/ui';

export function TransactionForm({
  theme, initialType, onSave,
}: { theme: Theme; initialType?: TransactionType; onSave: (t: NewTransaction) => void; onClose: () => void }) {
  const [type, setType] = useState<TransactionType>(initialType || 'expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(initialType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0].name);
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState(METHODS[0]);
  const [recurring, setRecurring] = useState(false);

  const changeType = (t: TransactionType) => {
    setType(t);
    setCategory(t === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0].name);
  };

  const submit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onSave({ type, amount: amt, category, date, description: description.trim(), method, recurring });
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

export function FixedExpenseForm({ theme, onSave }: { theme: Theme; onSave: (f: NewFixedExpense) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [paymentDay, setPaymentDay] = useState('1');
  const [method, setMethod] = useState(METHODS[0]);
  const [endDate, setEndDate] = useState('');

  const submit = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || !amt || amt <= 0) return;
    onSave({ name: name.trim(), amount: amt, category, paymentDay: parseInt(paymentDay) || 1, method, startDate: todayISO(), endDate: endDate || null });
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

export function InstallmentForm({ theme, onSave }: { theme: Theme; onSave: (i: NewInstallment) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [num, setNum] = useState('');
  const [paid, setPaid] = useState('0');

  const monthly = (parseFloat(total) || 0) / (parseInt(num) || 1);

  const submit = () => {
    const t = parseFloat(total);
    const n = parseInt(num);
    if (!name.trim() || !t || t <= 0 || !n || n <= 0) return;
    onSave({ name: name.trim(), totalAmount: t, numInstallments: n, paidInstallments: Math.min(parseInt(paid) || 0, n), startDate: todayISO() });
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
        <div style={{ background: theme.cardAlt, borderRadius: 12 }} className="p-3 mb-3 text-[13px]">
          <span style={{ color: theme.textSecondary }}>Cuota mensual: </span>
          <span style={{ color: theme.text }} className="font-semibold num">{fmt(monthly)}</span>
        </div>
      )}
      <PrimaryButton theme={theme} onClick={submit} disabled={!name.trim() || !total || !num}>Guardar cuota</PrimaryButton>
    </div>
  );
}

export function GoalForm({ theme, onSave }: { theme: Theme; onSave: (g: NewGoal) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [saved, setSaved] = useState('0');
  const [targetDate, setTargetDate] = useState('');

  const submit = () => {
    const g = parseFloat(goalAmount);
    if (!name.trim() || !g || g <= 0) return;
    onSave({ name: name.trim(), goalAmount: g, saved: parseFloat(saved) || 0, targetDate: targetDate || null });
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

export function AmountForm({
  theme, label, submitLabel, initial, onSave,
}: { theme: Theme; label: string; submitLabel: string; initial?: number; onSave: (n: number) => void }) {
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
