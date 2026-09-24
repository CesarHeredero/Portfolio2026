import type { Metadata } from 'next';
import { AuthGate } from '@/components/admin/auth-gate';
import { AdminApp } from '@/components/admin/admin-app';

export const metadata: Metadata = {
  title: 'Intranet',
};

export default function AdminPage() {
  return (
    <AuthGate>
      <AdminApp />
    </AuthGate>
  );
}
