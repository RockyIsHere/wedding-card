import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import MenuDashboard from '@/components/admin/MenuDashboard';

export const metadata: Metadata = {
  title: 'Food Menu | R & S Wedding',
  robots: { index: false, follow: false },
};

export default async function AdminMenuPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session || session.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin/login');
  }

  return (
    <AdminShell>
      <MenuDashboard />
    </AdminShell>
  );
}
