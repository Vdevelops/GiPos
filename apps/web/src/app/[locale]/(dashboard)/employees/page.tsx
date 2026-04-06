import { PageHeader } from "@/components/layout/page-header"
import { EmployeeAccess } from "@/features/employees/components/employee-access"
import { getTranslations } from 'next-intl/server';

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <>
      <PageHeader
        title={t('employees.title')}
        breadcrumbItems={[
          { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
          { label: t('nav.employees') },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <EmployeeAccess />
      </div>
    </>
  )
}


