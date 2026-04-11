"use client"

import { Sparkles, TrendingUp, TrendingDown, Smartphone, Utensils, Scissors, Pill, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PremiumFeatures() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Premium Features</h1>
        <p className="text-muted-foreground">
          Fitur-fitur advanced untuk meningkatkan efisiensi bisnis
        </p>
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai">AI Sales Insight</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Dashboard</TabsTrigger>
          <TabsTrigger value="modes">Mode Khusus</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Sales Insight</CardTitle>
              <CardDescription>
                Rekomendasi berbasis AI untuk optimasi bisnis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Restock Recommendations</h3>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">Produk A</p>
                          <p className="text-sm text-muted-foreground">Stok: 5</p>
                        </div>
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Low Stock
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rekomendasi</span>
                          <span className="font-medium">Restock 50 pcs</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Confidence</span>
                          <Badge variant="secondary">85%</Badge>
                        </div>
                        <Button size="sm" className="w-full">
                          Restock Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Promo Recommendations</h3>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">Produk B</p>
                          <p className="text-sm text-muted-foreground">Slow Moving</p>
                        </div>
                        <Badge variant="secondary">Promo</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rekomendasi</span>
                          <span className="font-medium">Diskon 15%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Prediksi Impact</span>
                          <Badge variant="default">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +20% penjualan
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          Apply Promo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Prediction</CardTitle>
                  <CardDescription>
                    Prediksi omzet untuk periode mendatang
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Prediksi Omzet Bulan Depan</p>
                      <p className="text-2xl font-bold">Rp 75.000.000</p>
                      <p className="text-sm text-muted-foreground">± 10% confidence interval</p>
                    </div>
                    <div className="h-[150px] flex items-center justify-center border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground">Chart akan ditampilkan di sini</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Dashboard Preview</CardTitle>
              <CardDescription>
                Dashboard untuk owner di mobile device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8">
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Omzet</p>
                        <p className="text-lg font-bold">Rp 2.5M</p>
                        <Badge variant="default" className="mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +15%
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Profit</p>
                        <p className="text-lg font-bold">Rp 500K</p>
                        <Badge variant="default" className="mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +20%
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pending Approvals: 2</p>
                    <Button size="sm" className="w-full">View Details</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  <CardTitle>Mode Restoran</CardTitle>
                </div>
                <CardDescription>
                  Table management, KDS, order per meja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Table Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Kitchen Display System</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Split Bill</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Aktifkan Mode Restoran
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  <CardTitle>Mode Salon</CardTitle>
                </div>
                <CardDescription>
                  Booking, jadwal, komisi terapis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Booking & Schedule</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Stylist Assignment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Commission Tracking</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Aktifkan Mode Salon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <CardTitle>Mode Apotek</CardTitle>
                </div>
                <CardDescription>
                  Resep, batch tracking, expiry alert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Prescription Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Batch & Expiry Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Drug Interaction Check</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Aktifkan Mode Apotek
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

