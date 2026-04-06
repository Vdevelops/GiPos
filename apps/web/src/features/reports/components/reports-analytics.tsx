"use client"

import { Download, FileText, TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ReportsAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan & Analitik</h1>
          <p className="text-muted-foreground">
            Analisis performa bisnis dan laporan detail
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="financial">Keuangan</TabsTrigger>
          <TabsTrigger value="employees">Karyawan</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          {/* Date Range Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Laporan Penjualan</CardTitle>
              <CardDescription>
                Pilih periode untuk melihat laporan penjualan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select defaultValue="today">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="yesterday">Kemarin</SelectItem>
                    <SelectItem value="week">7 Hari Terakhir</SelectItem>
                    <SelectItem value="month">30 Hari Terakhir</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Omzet</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 25.000.000</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +15% vs periode lalu
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaksi</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.250</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +10% vs periode lalu
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 20.000</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% vs periode lalu
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produk Terjual</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5.450</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +8% vs periode lalu
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Transaksi</CardTitle>
              <CardDescription>
                Daftar transaksi penjualan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Metode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell>01 Jan 2024 10:{30 + i}</TableCell>
                      <TableCell>Kasir {i}</TableCell>
                      <TableCell>Produk {i}</TableCell>
                      <TableCell>{i}</TableCell>
                      <TableCell>Rp {(50000 + i * 10000).toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">QRIS</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analitik Produk</CardTitle>
              <CardDescription>
                Analisis performa produk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Top 10 Produk Terlaris</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <TableRow key={i}>
                          <TableCell>#{i}</TableCell>
                          <TableCell>Produk {i}</TableCell>
                          <TableCell>{100 - i * 5}</TableCell>
                          <TableCell>Rp {(5000000 - i * 200000).toLocaleString("id-ID")}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{(20 + i * 2)}%</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Laba Rugi (P&L)</CardTitle>
              <CardDescription>
                Periode: Januari 2024
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Revenue</span>
                  <span className="text-lg font-bold">Rp 50.000.000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">COGS</span>
                  <span className="text-lg">Rp 30.000.000</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-semibold">Gross Profit</span>
                  <span className="text-xl font-bold">Rp 20.000.000</span>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <span>Gaji</span>
                    <span>Rp 10.000.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sewa</span>
                    <span>Rp 5.000.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilities</span>
                    <span>Rp 2.000.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing</span>
                    <span>Rp 1.000.000</span>
                  </div>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-semibold">Net Profit</span>
                  <span className="text-xl font-bold text-green-600">Rp 2.000.000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performa Karyawan</CardTitle>
              <CardDescription>
                Analisis kinerja kasir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Transaksi</TableHead>
                    <TableHead>Total Omzet</TableHead>
                    <TableHead>Rata-rata</TableHead>
                    <TableHead>Error Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4].map((i) => (
                    <TableRow key={i}>
                      <TableCell>Kasir {i}</TableCell>
                      <TableCell>{100 + i * 25}</TableCell>
                      <TableCell>Rp {(5000000 + i * 1000000).toLocaleString("id-ID")}</TableCell>
                      <TableCell>Rp {(50000 + i * 5000).toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Badge variant={i === 1 ? "destructive" : "secondary"}>
                          {i === 1 ? "2.5%" : "< 1%"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


