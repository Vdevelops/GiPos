import { PageHeader } from "@/components/layout/page-header"
import { ReportsAnalytics } from "@/features/reports/components/reports-analytics"
import { getTranslations } from 'next-intl/server';

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('reports.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.reports') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ReportsAnalytics />
      </div>
    </>
  )
}


