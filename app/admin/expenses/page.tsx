import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ExpenseDashboard from '@/components/admin/ExpenseDashboard';

export const metadata: Metadata = {
  title: 'Expense Dashboard | R & S Wedding',
  robots: { index: false, follow: false },
};

export default async function AdminExpensesPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session || session.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin/login');
  }

  return (
    <AdminShell>
      <ExpenseDashboard />
    </AdminShell>
  );
}
