'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownRight, ArrowUpRight, ChevronRight, CreditCard, LogOut, Moon, Plus, Sun, Target,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getTheme } from '@/lib/theme';
import { computeFinance } from '@/lib/computations';
import { TABS } from '@/lib/constants';
import type { TabDef } from '@/lib/constants';
import type { FinanceData, ModalState, NewFixedExpense, NewGoal, NewInstallment, NewTransaction } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Sheet, IconCircle } from '@/components/ui';
import { AmountForm, FixedExpenseForm, GoalForm, InstallmentForm, TransactionForm } from '@/components/forms';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { TransactionsScreen } from '@/components/screens/TransactionsScreen';
import { CommitmentsScreen } from '@/components/screens/CommitmentsScreen';
import { BudgetScreen } from '@/components/screens/BudgetScreen';
import { GoalsScreen } from '@/components/screens/GoalsScreen';

export default function AppShell({ initialData, userId }: { initialData: FinanceData; userId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const {
    data, addTransaction, deleteTransaction, addFixed, deleteFixed,
    addInstallment, deleteInstallment, payInstallment,
    addGoal, deleteGoal, contributeGoal, setBudget, setBalance,
  } = useFinanceData(initialData, userId);

  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<TabDef['id']>('home');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const theme = getTheme(dark);
  const now = new Date();

  const openModal = (m: ModalState) => setModal(m);
  const closeModal = () => setModal(null);

  const handleAddTransaction = (t: NewTransaction) => { addTransaction(t); closeModal(); };
  const handleAddFixed = (f: NewFixedExpense) => { addFixed(f); closeModal(); };
  const handleAddInstallment = (i: NewInstallment) => { addInstallment(i); closeModal(); };
  const handleAddGoal = (g: NewGoal) => { addGoal(g); closeModal(); };
  const handleContribute = (amt: number) => {
    if (modal && modal.type === 'contribute' && modal.goalId) contributeGoal(modal.goalId, amt);
    closeModal();
  };
  const handleSetBudget = (amt: number) => {
    if (modal && modal.type === 'budget' && modal.category) setBudget(modal.category, amt);
    closeModal();
  };
  const handleSetBalance = (amt: number) => { setBalance(amt); closeModal(); };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const computed = useMemo(() => computeFinance(data, now), [data, now.getDate()]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <button onClick={handleLogout} style={{ color: theme.textSecondary }} className="flex items-center gap-2.5 px-3 py-2.5 text-[13px]">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-end gap-2 p-3 md:hidden">
            <button onClick={handleLogout} style={{ background: theme.card }} className="w-8 h-8 rounded-full flex items-center justify-center">
              <LogOut size={15} style={{ color: theme.text }} />
            </button>
            <button onClick={() => setDark(!dark)} style={{ background: theme.card }} className="w-8 h-8 rounded-full flex items-center justify-center">
              {dark ? <Sun size={15} style={{ color: theme.text }} /> : <Moon size={15} style={{ color: theme.text }} />}
            </button>
          </div>
          <div className="max-w-[560px] mx-auto px-4 pb-28 md:pb-10 md:pt-6">
            {tab === 'home' && <HomeScreen theme={theme} data={data} now={now} computed={computed} openModal={openModal} setTab={setTab} />}
            {tab === 'transactions' && <TransactionsScreen theme={theme} data={data} now={now} openModal={openModal} deleteTransaction={deleteTransaction} />}
            {tab === 'commitments' && <CommitmentsScreen theme={theme} data={data} computed={computed} openModal={openModal} deleteFixed={deleteFixed} deleteInstallment={deleteInstallment} payInstallment={payInstallment} />}
            {tab === 'budget' && <BudgetScreen theme={theme} data={data} computed={computed} openModal={openModal} />}
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
          <TransactionForm theme={theme} initialType={modal.txType} onSave={handleAddTransaction} onClose={closeModal} />
        </Sheet>
      )}
      {modal && modal.type === 'fixed' && (
        <Sheet title="Nuevo gasto fijo" theme={theme} onClose={closeModal}>
          <FixedExpenseForm theme={theme} onSave={handleAddFixed} onClose={closeModal} />
        </Sheet>
      )}
      {modal && modal.type === 'installment' && (
        <Sheet title="Nueva cuota" theme={theme} onClose={closeModal}>
          <InstallmentForm theme={theme} onSave={handleAddInstallment} onClose={closeModal} />
        </Sheet>
      )}
      {modal && modal.type === 'goal' && (
        <Sheet title="Nueva meta" theme={theme} onClose={closeModal}>
          <GoalForm theme={theme} onSave={handleAddGoal} onClose={closeModal} />
        </Sheet>
      )}
      {modal && modal.type === 'contribute' && (
        <Sheet title="Abonar a la meta" theme={theme} onClose={closeModal}>
          <AmountForm theme={theme} label="Monto a abonar" submitLabel="Abonar" onSave={handleContribute} />
        </Sheet>
      )}
      {modal && modal.type === 'budget' && (
        <Sheet title={`Presupuesto · ${modal.category ?? ''}`} theme={theme} onClose={closeModal}>
          <AmountForm theme={theme} label="Monto mensual" submitLabel="Guardar" initial={data.budgets[modal.category ?? '']} onSave={handleSetBudget} />
        </Sheet>
      )}
      {modal && modal.type === 'balance' && (
        <Sheet title="Editar saldo base" theme={theme} onClose={closeModal}>
          <p style={{ color: theme.textSecondary }} className="text-[12.5px] mb-3">Es el monto base sobre el que se calcula tu disponible, sumando tus ingresos y restando tus gastos de este mes.</p>
          <AmountForm theme={theme} label="Saldo base" submitLabel="Guardar" initial={data.initialBalance} onSave={handleSetBalance} />
        </Sheet>
      )}
    </div>
  );
}
