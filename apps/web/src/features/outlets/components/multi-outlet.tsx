"use client"

import { Plus, ArrowRightLeft, TrendingUp, Store, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MultiOutlet() {
  // Mock outlets
  const outlets = [
    {
      id: 1,
      name: "Outlet A - Cabang Pusat",
      address: "Jl. Merdeka No. 123",
      status: "aktif",
      revenue: 5000000,
      transactions: 250,
    },
    {
      id: 2,
      name: "Outlet B - Cabang Mall",
      address: "Mall Grand, Lt. 2",
      status: "aktif",
      revenue: 8000000,
      transactions: 400,
    },
    {
      id: 3,
      name: "Outlet C - Cabang Plaza",
      address: "Plaza Indah, Lt. 1",
      status: "aktif",
      revenue: 7000000,
      transactions: 350,
    },
  ]

  const totalRevenue = outlets.reduce((sum, outlet) => sum + outlet.revenue, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Outlet</h1>
          <p className="text-muted-foreground">
            Kelola multiple outlet dan transfer stok
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Outlet
        </Button>
      </div>

      {/* Consolidated Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Konsolidasi - Hari Ini</CardTitle>
          <CardDescription>
            Total semua outlet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Omzet</p>
              <p className="text-2xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
              <p className="text-2xl font-bold">
                {outlets.reduce((sum, outlet) => sum + outlet.transactions, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jumlah Outlet</p>
              <p className="text-2xl font-bold">{outlets.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="outlets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="outlets">Outlet</TabsTrigger>
          <TabsTrigger value="transfer">Transfer Stok</TabsTrigger>
          <TabsTrigger value="consolidation">Konsolidasi</TabsTrigger>
        </TabsList>

        <TabsContent value="outlets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {outlets.map((outlet) => (
              <Card key={outlet.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">{outlet.name}</CardTitle>
                    </div>
                    <Badge variant={outlet.status === "aktif" ? "default" : "secondary"}>
                      {outlet.status}
                    </Badge>
                  </div>
                  <CardDescription>{outlet.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Omzet Hari Ini</span>
                    <span className="font-semibold">Rp {outlet.revenue.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transaksi</span>
                    <span className="text-sm">{outlet.transactions}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <Button variant="outline" className="w-full" size="sm">
                      Lihat Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Stok Antar Outlet</CardTitle>
              <CardDescription>
                Request dan approve transfer stok
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Pending Transfers</p>
                  <p className="text-sm text-muted-foreground">3 request menunggu approval</p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Request Transfer
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dari</TableHead>
                    <TableHead>Ke</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Outlet A</TableCell>
                    <TableCell>Outlet B</TableCell>
                    <TableCell>Produk A</TableCell>
                    <TableCell>10</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Approve</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Outlet B</TableCell>
                    <TableCell>Outlet C</TableCell>
                    <TableCell>Produk B</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>
                      <Badge variant="default">Approved</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" disabled>Completed</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consolidation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Konsolidasi</CardTitle>
              <CardDescription>
                Breakdown per outlet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Omzet: Rp {totalRevenue.toLocaleString("id-ID")}</p>
                  <div className="space-y-2">
                    {outlets.map((outlet) => {
                      const percentage = (outlet.revenue / totalRevenue) * 100
                      return (
                        <div key={outlet.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{outlet.name}</span>
                            <span className="text-sm">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Rp {outlet.revenue.toLocaleString("id-ID")}</span>
                            <span>{outlet.transactions} transaksi</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


