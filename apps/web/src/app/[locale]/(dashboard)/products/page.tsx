import { PageHeader } from "@/components/layout/page-header"
import { ProductInventory } from "@/features/products/components/product-inventory"
import { getTranslations } from 'next-intl/server';

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('products.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.products') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ProductInventory />
      </div>
    </>
  )
}


