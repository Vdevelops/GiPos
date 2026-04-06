import { PageHeader } from "@/components/layout/page-header"
import { MultiOutlet } from "@/features/outlets/components/multi-outlet"
import { getTranslations } from 'next-intl/server';

export default async function OutletsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('outlets.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.outlets') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <MultiOutlet />
      </div>
    </>
  )
}


