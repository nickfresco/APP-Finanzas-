'use client';

import { useEffect, useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getTheme } from '@/lib/theme';
import { Field, PrimaryButton, inputStyle } from '@/components/ui';

export default function LoginForm() {
  const theme = getTheme(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [callbackReason, setCallbackReason] = useState<string | null>(null);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('reason');
    if (reason) setCallbackReason(reason);
  }, []);

  const submit = async () => {
    if (!email.trim()) return;
    setStatus('sending');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? 'error' : 'sent');
  };

  return (
    <div style={{ background: theme.bg }} className="min-h-[600px] w-full flex items-center justify-center p-6">
      <div style={{ background: theme.card, borderRadius: 24 }} className="w-full max-w-[360px] p-6">
        <div style={{ background: theme.accent + '22', width: 48, height: 48, borderRadius: 24 }} className="flex items-center justify-center mb-4">
          <Mail size={22} style={{ color: theme.accent }} />
        </div>
        <h1 style={{ color: theme.text }} className="text-[20px] font-bold mb-1">Mis Finanzas</h1>

        {callbackReason && status !== 'sent' && (
          <div className="flex items-start gap-2.5 mb-4 p-3" style={{ background: theme.red + '15', borderRadius: 12 }}>
            <AlertCircle size={16} style={{ color: theme.red }} className="shrink-0 mt-0.5" />
            <p style={{ color: theme.red }} className="text-[12.5px] leading-relaxed">
              No se pudo completar el login: {callbackReason}
            </p>
          </div>
        )}
        {status === 'sent' ? (
          <div className="flex items-start gap-2.5 mt-4">
            <CheckCircle2 size={18} style={{ color: theme.green }} className="shrink-0 mt-0.5" />
            <p style={{ color: theme.textSecondary }} className="text-[13px] leading-relaxed">
              Te enviamos un link de acceso a <span style={{ color: theme.text }} className="font-medium">{email}</span>. Ábrelo desde este dispositivo para entrar.
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: theme.textSecondary }} className="text-[13px] mb-4">Ingresa tu email y te enviamos un link para entrar, sin contraseña.</p>
            <Field label="Email" theme={theme}>
              <input
                type="email"
                inputMode="email"
                autoFocus
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                style={inputStyle(theme)}
              />
            </Field>
            {status === 'error' && (
              <p style={{ color: theme.red }} className="text-[12.5px] mb-3">No pudimos enviar el link. Intenta nuevamente.</p>
            )}
            <PrimaryButton theme={theme} onClick={submit} disabled={!email.trim() || status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Enviar link mágico'}
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}
