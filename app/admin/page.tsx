import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import GroceryDashboard from '@/components/admin/GroceryDashboard';

export const metadata: Metadata = {
  title: 'Admin | R & S Wedding',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session || session.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin/login');
  }

  return (
    <AdminShell>
      <GroceryDashboard />
    </AdminShell>
  );
}
