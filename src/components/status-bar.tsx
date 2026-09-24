'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type Tone = 'live' | 'soft' | 'mute' | 'off';

const STATUS_TONE: Record<string, Tone> = {
  searching: 'live',
  open: 'live',
  freelance: 'live',
  consulting: 'live',
  collab: 'live',
  selective: 'soft',
  busy: 'mute',
  hidden: 'off',
};

const STATUS_LABEL: Record<string, string> = {
  searching: 'En búsqueda activa',
  open: 'Abierto a ofertas',
  freelance: 'Freelance disponible',
  consulting: 'Acepto consultorías',
  collab: 'Abierto a colaboraciones',
  selective: 'Escuchando ofertas selectas',
  busy: 'No disponible',
  hidden: '',
};

function getStatusFromCookie(): string {
  if (typeof document === 'undefined') return 'open';
  const match = document.cookie.match(/(?:^| )ch_status=([^;]+)/);
  return match?.[1] ?? 'open';
}

export function StatusBar() {
  const t = useTranslations('statusBar');
  const [status, setStatus] = useState('open');
  const [mounted, setMounted] = useState(false);
  const [clock, setClock] = useState('');

  useEffect(() => {
    setMounted(true);
    setStatus(getStatusFromCookie());

    const tick = () => {
      const now = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Madrid',
      });
      setClock(`MAD · ${now} CEST`);
    };
    tick();
    const id = setInterval(tick, 30000);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ status: string }>).detail;
      if (detail?.status) {
        setStatus(detail.status);
        document.cookie = `ch_status=${detail.status};path=/;max-age=${60 * 60 * 24 * 365}`;
      }
    };
    window.addEventListener('ch:status', handler);
    return () => {
      window.removeEventListener('ch:status', handler);
      clearInterval(id);
    };
  }, []);

  const tone = STATUS_TONE[status] ?? 'live';
  const label = STATUS_LABEL[status] ?? t('availableText');
  const hidden = status === 'hidden';

  return (
    <div className="statusbar" role="banner" aria-label="Status bar">
      <div className="statusbar__inner">
        <div className="statusbar__left">
          {mounted && !hidden && (
            <>
              <span className={`statusbar__dot statusbar__dot--${tone}`} aria-hidden="true" />
              <span className="statusbar__text--bright">{label}</span>
              <span className="statusbar__sep" />
            </>
          )}
          <span className="statusbar__text">{t('version')}</span>
        </div>
        <div className="statusbar__right">
          {mounted && (
            <>
              <span className="statusbar__text">{clock}</span>
              <span className="statusbar__sep" />
              <span className="statusbar__text statusbar__coords">40.4168°N · −3.7038°W</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
