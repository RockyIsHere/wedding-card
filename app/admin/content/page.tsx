import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ContentDashboard from '@/components/admin/ContentDashboard';

export const metadata: Metadata = {
  title: 'Content CMS | R & S Wedding',
  robots: { index: false, follow: false },
};

export default async function AdminContentPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session || session.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin/login');
  }

  return (
    <AdminShell>
      <ContentDashboard />
    </AdminShell>
  );
}
