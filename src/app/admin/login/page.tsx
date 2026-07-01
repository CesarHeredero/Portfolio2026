'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

// Demo credentials: cesar / flexicar2026
const DEMO_USER = 'cesar';
const DEMO_PASS = 'flexicar2026';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (username === DEMO_USER && password === DEMO_PASS) {
        document.cookie = `ch_admin=authenticated;path=/;max-age=${60 * 60 * 8}`;
        router.push('/admin');
      } else {
        setError('Credenciales incorrectas. Usa las credenciales de demo.');
        setLoading(false);
      }
    }, 500);
  }

  return (
    <div className="login-layout">
      <div className="login-form-side">
        <div className="login-form-inner">
          <Link href="/es" className="login-logo" aria-label="Back to portfolio">
            <div className="login-logo__mark" aria-hidden="true">CH</div>
            <span className="login-logo__name">César Heredero</span>
          </Link>

          <h1 className="login-title">Acceso admin</h1>
          <p className="login-sub">Panel interno de gestión del portfolio</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form__field">
              <label htmlFor="login-user" className="form__label">
                Usuario
              </label>
              <input
                id="login-user"
                type="text"
                className="form__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
            <div className="form__field">
              <label htmlFor="login-pass" className="form__label">
                Contraseña
              </label>
              <input
                id="login-pass"
                type="password"
                className="form__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p
                id="login-error"
                role="alert"
                style={{ color: 'var(--bad)', fontSize: 'var(--fs-13)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
              style={{ alignSelf: 'flex-start' }}
            >
              {loading ? 'Entrando…' : 'Entrar →'}
            </button>
          </form>

          <div className="login-demo" role="note" aria-label="Demo credentials">
            <strong>Demo:</strong> usuario <code>cesar</code> / contraseña{' '}
            <code>flexicar2026</code>
          </div>
        </div>
      </div>

      <div className="login-panel" aria-hidden="true">
        <p className="login-panel__sup">Portfolio 2026</p>
        <h2 className="login-panel__title">
          Panel de<br />administración
        </h2>
        <p className="login-panel__body">
          Gestiona casos, actualiza tu perfil y revisa las métricas del portfolio desde un solo lugar.
        </p>
        <ul className="login-panel__list">
          <li className="login-panel__list-item">Gestión de casos documentados</li>
          <li className="login-panel__list-item">Control de disponibilidad</li>
          <li className="login-panel__list-item">Personalización del portfolio</li>
        </ul>
      </div>
    </div>
  );
}
