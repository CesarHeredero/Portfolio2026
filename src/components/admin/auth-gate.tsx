'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  const match = document.cookie.match(/(?:^| )ch_admin=([^;]+)/);
  return match?.[1] === 'authenticated';
}

export function AuthGate({ children }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ok = isAuthenticated();
    setAuthed(ok);
    setChecked(true);
    if (!ok) {
      router.replace('/admin/login');
    }
  }, [router]);

  if (!checked) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'var(--ink-400)',
          fontSize: 'var(--fs-14)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        Loading…
      </div>
    );
  }

  if (!authed) return null;

  return <>{children}</>;
}
