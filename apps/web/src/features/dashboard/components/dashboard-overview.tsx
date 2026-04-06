"use client"

import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from 'next-intl'

export function DashboardOverview() {
  const t = useTranslations('dashboard')
  
  const metrics = [
    {
      title: t('totalRevenue'),
      value: "Rp 2.500.000",
      change: "+15%",
      trend: "up",
      description: t('vsYesterday'),
      icon: DollarSign,
    },
    {
      title: t('profit'),
      value: "Rp 500.000",
      change: "+20%",
      trend: "up",
      description: t('vsYesterday'),
      icon: TrendingUp,
    },
    {
      title: t('transactions'),
      value: "125",
      change: "+10%",
      trend: "up",
      description: t('today'),
      icon: ShoppingCart,
    },
    {
      title: t('productsSold'),
      value: "45",
      change: "+5%",
      trend: "up",
      description: t('today'),
      icon: Package,
    },
    {
      title: t('newCustomers'),
      value: "12",
      change: "-8%",
      trend: "down",
      description: t('today'),
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('summary')}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Badge variant={metric.trend === "up" ? "default" : "secondary"}>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}
                </Badge>
                <span>{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('revenueChart')}</CardTitle>
            <CardDescription>
              {t('revenueChartDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">{t('chartPlaceholder')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('topProducts')}</CardTitle>
            <CardDescription>
              {t('topProductsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted" />
                    <div>
                      <p className="text-sm font-medium">{t('product')} {i}</p>
                      <p className="text-xs text-muted-foreground">{t('sold')}: {10 + i * 2}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">Rp {(100 + i * 50) * 1000}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('paymentMethods')}</CardTitle>
            <CardDescription>
              {t('paymentMethodsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">{t('pieChartPlaceholder')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
            <CardDescription>
              {t('recentActivityDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t('transaction')} #{1000 + i}</p>
                    <p className="text-xs text-muted-foreground">10:{30 + i} WIB</p>
                  </div>
                  <p className="text-sm font-semibold">Rp {(50 + i * 10) * 1000}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


