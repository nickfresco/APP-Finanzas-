import type { ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';
import type { Theme } from '@/lib/theme';
import { fmt } from '@/lib/utils';

export function StatCard({ label, value, theme, tone }: { label: string; value: number; theme: Theme; tone?: 'green' | 'red' }) {
  const color = tone === 'green' ? theme.green : tone === 'red' ? theme.red : theme.text;
  return (
    <div style={{ background: theme.card, borderRadius: 18 }} className="p-3.5 flex-1 min-w-0">
      <div style={{ color: theme.textSecondary }} className="text-[12px] font-medium truncate">{label}</div>
      <div style={{ color }} className="num text-[17px] font-semibold mt-1 truncate">{fmt(value)}</div>
    </div>
  );
}

export function ProgressBar({ pct, theme, color }: { pct: number; theme: Theme; color?: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const barColor = color || (pct >= 100 ? theme.red : pct >= 80 ? theme.orange : theme.green);
  return (
    <div style={{ background: theme.cardAlt, height: 8, borderRadius: 999 }} className="w-full overflow-hidden">
      <div style={{ width: `${clamped}%`, background: barColor, height: '100%', borderRadius: 999, transition: 'width 0.4s ease' }} />
    </div>
  );
}

export function SectionTitle({ children, theme, action }: { children: ReactNode; theme: Theme; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2.5 mt-6 first:mt-0">
      <h2 style={{ color: theme.text }} className="text-[15px] font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ theme, text, icon: Icon }: { theme: Theme; text: string; icon?: LucideIcon }) {
  return (
    <div style={{ background: theme.card, borderRadius: 18, color: theme.textSecondary }} className="p-8 flex flex-col items-center text-center gap-2">
      {Icon && <Icon size={26} style={{ color: theme.textSecondary }} />}
      <p className="text-[13px] leading-relaxed max-w-[220px]">{text}</p>
    </div>
  );
}

export function IconCircle({ Icon, color, size = 38 }: { Icon: LucideIcon; color: string; size?: number }) {
  return (
    <div style={{ background: color + '22', width: size, height: size, borderRadius: size / 2 }} className="flex items-center justify-center shrink-0">
      <Icon size={size * 0.5} style={{ color }} strokeWidth={2.2} />
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options, value, onChange, theme,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; theme: Theme }) {
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

export function Field({ label, children, theme }: { label: string; children: ReactNode; theme: Theme }) {
  return (
    <div className="mb-4">
      <label style={{ color: theme.textSecondary }} className="text-[12px] font-medium block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function inputStyle(theme: Theme): React.CSSProperties {
  return {
    background: theme.cardAlt, color: theme.text, borderRadius: 12,
    padding: '11px 13px', width: '100%', border: `1px solid ${theme.border}`, fontSize: 15,
  };
}

export function Sheet({ title, onClose, theme, children }: { title: string; onClose: () => void; theme: Theme; children: ReactNode }) {
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

export function PrimaryButton({ children, onClick, theme, disabled }: { children: ReactNode; onClick: () => void; theme: Theme; disabled?: boolean }) {
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
