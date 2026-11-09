import Head from 'next/head';
import AdminProductLayout from '@/components/admin/AdminProductLayout';
import AbandonedOrdersTable from '@/components/admin/AbandonedOrdersTable';
import { markAbandonedSeen } from '@/components/admin/useAbandonedBadge';

export default function AdminAbandonedOrders() {
  return (
    <AdminProductLayout title="Abandoned Orders">
      <Head>
        <title>Abandoned Orders | Hat Bazar Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AbandonedOrdersTable onLoaded={markAbandonedSeen} />
    </AdminProductLayout>
  );
}
