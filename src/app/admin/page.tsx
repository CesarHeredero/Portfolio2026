import type { Metadata } from 'next';
import { AuthGate } from '@/components/admin/auth-gate';
import { AdminNav } from '@/components/admin/admin-nav';
import { Dashboard } from '@/components/admin/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function AdminPage() {
  return (
    <AuthGate>
      <div className="admin-layout">
        <AdminNav />
        <div className="admin-main">
          <div className="admin-topbar">
            <h1 className="admin-topbar__title">Dashboard</h1>
          </div>
          <Dashboard />
        </div>
      </div>
    </AuthGate>
  );
}
