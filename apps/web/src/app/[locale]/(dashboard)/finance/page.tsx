import { PageHeader } from "@/components/layout/page-header"
import { FinanceManagement } from "@/features/finance/components/finance-management"
import { getTranslations } from 'next-intl/server';

export default async function FinancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('finance.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.finance') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <FinanceManagement />
      </div>
    </>
  )
}


