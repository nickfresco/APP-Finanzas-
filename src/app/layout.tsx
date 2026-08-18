import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mis Finanzas',
  description: 'App de finanzas personales',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
