import { PageHeader } from "@/components/layout/page-header"
import { CustomerManagement } from "@/features/customers/components/customer-management"
import { getTranslations } from 'next-intl/server';

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('customers.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.customers') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <CustomerManagement />
      </div>
    </>
  )
}


