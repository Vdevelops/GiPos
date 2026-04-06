import { PageHeader } from "@/components/layout/page-header"
import { POSInterface } from "@/features/pos/components/pos-interface"
import { getTranslations } from 'next-intl/server';

export default async function POSPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('pos.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.pos') },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <POSInterface />
      </div>
    </>
  )
}


