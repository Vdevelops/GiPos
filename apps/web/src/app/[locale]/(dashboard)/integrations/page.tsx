import { PageHeader } from "@/components/layout/page-header"
import { ExternalIntegration } from "@/features/integrations/components/external-integration"
import { getTranslations } from 'next-intl/server';

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('integrations.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.integrations') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ExternalIntegration />
      </div>
    </>
  )
}


