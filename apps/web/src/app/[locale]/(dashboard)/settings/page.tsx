import { PageHeader } from "@/components/layout/page-header"
import { SettingsPage } from "@/features/settings/components/settings-page"
import { getTranslations } from 'next-intl/server';

export default async function Settings({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('settings.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.settings') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <SettingsPage />
      </div>
    </>
  )
}


