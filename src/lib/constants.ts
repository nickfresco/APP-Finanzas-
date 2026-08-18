import {
  Home, Receipt, CreditCard, PiggyBank, Target,
  Utensils, Car, Film, ShoppingBag, HeartPulse, Smartphone, Plane, GraduationCap,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryMeta {
  name: string;
  icon: LucideIcon;
  color: string;
}

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
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

export const INCOME_CATEGORIES = ['Sueldo', 'Freelance', 'Bono', 'Otro ingreso'];
export const METHODS = ['Débito', 'Crédito', 'Efectivo', 'Transferencia'];
export const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export interface TabDef {
  id: 'home' | 'transactions' | 'commitments' | 'budget' | 'goals';
  label: string;
  icon: LucideIcon;
}

export const TABS: TabDef[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'transactions', label: 'Movimientos', icon: Receipt },
  { id: 'commitments', label: 'Compromisos', icon: CreditCard },
  { id: 'budget', label: 'Presupuesto', icon: PiggyBank },
  { id: 'goals', label: 'Metas', icon: Target },
];
