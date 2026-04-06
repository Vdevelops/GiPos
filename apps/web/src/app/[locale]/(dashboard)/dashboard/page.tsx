import { PageHeader } from "@/components/layout/page-header"
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview"
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('dashboard.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('dashboard.overview') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <DashboardOverview />
      </div>
    </>
  )
}

