'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type Status = 'available' | 'busy' | 'off';

function getStatusFromCookie(): Status {
  if (typeof document === 'undefined') return 'available';
  const match = document.cookie.match(/(?:^| )ch_status=([^;]+)/);
  const val = match?.[1];
  if (val === 'busy' || val === 'off' || val === 'available') return val;
  return 'available';
}

export function StatusBar() {
  const t = useTranslations('statusBar');
  const [status, setStatus] = useState<Status>('available');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStatus(getStatusFromCookie());

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ status: Status }>).detail;
      if (detail?.status) {
        setStatus(detail.status);
        document.cookie = `ch_status=${detail.status};path=/;max-age=${60 * 60 * 24 * 365}`;
      }
    };

    window.addEventListener('ch:status', handler);
    return () => window.removeEventListener('ch:status', handler);
  }, []);

  const statusLabel =
    status === 'busy'
      ? t('busyText')
      : status === 'off'
        ? t('offText')
        : t('availableText');

  return (
    <div className="statusbar" role="banner" aria-label="Status bar">
      <div className="statusbar__inner">
        <div className="statusbar__left">
          <span className="statusbar__text">César Heredero</span>
          <span className="statusbar__sep" />
          <span className="statusbar__text">{t('role')}</span>
        </div>
        <div className="statusbar__right">
          {mounted && (
            <>
              <span
                className={`statusbar__dot${status === 'busy' ? ' statusbar__dot--busy' : status === 'off' ? ' statusbar__dot--off' : ''}`}
                aria-hidden="true"
              />
              <span className="statusbar__text--bright">{statusLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
