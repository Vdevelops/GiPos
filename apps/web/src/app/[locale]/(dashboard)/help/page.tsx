import { PageHeader } from "@/components/layout/page-header"
import { HelpPage } from "@/features/help/components/help-page"
import { getTranslations } from 'next-intl/server';

export default async function Help({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('help.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.help') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <HelpPage />
      </div>
    </>
  )
}


