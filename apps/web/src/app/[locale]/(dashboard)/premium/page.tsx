import { PageHeader } from "@/components/layout/page-header"
import { PremiumFeatures } from "@/features/premium/components/premium-features"
import { getTranslations } from 'next-intl/server';

export default async function PremiumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('premium.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.premium') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <PremiumFeatures />
      </div>
    </>
  )
}


