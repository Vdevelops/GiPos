"use client"

import { Plus, ArrowUp, ArrowDown, CheckCircle2, XCircle, FileText } from "lucide-react"
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

export function FinanceManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
          <p className="text-muted-foreground">
            Kelola buku kas, rekonsiliasi, dan laporan keuangan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Pemasukan
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Pengeluaran
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Saldo Kas</CardTitle>
          <CardDescription>Saldo real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">Rp 15.000.000</div>
          <div className="flex gap-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Pemasukan</p>
              <p className="text-lg font-semibold text-green-600">Rp 20.000.000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
              <p className="text-lg font-semibold text-red-600">Rp 5.000.000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cashbook" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cashbook">Buku Kas</TabsTrigger>
          <TabsTrigger value="reconciliation">Rekonsiliasi</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="cashbook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>History Transaksi</CardTitle>
              <CardDescription>
                Semua pemasukan dan pengeluaran
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Metode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>01 Jan 2024</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Pemasukan
                      </Badge>
                    </TableCell>
                    <TableCell>Penjualan</TableCell>
                    <TableCell>Transaksi harian</TableCell>
                    <TableCell className="text-green-600 font-semibold">+Rp 2.500.000</TableCell>
                    <TableCell>QRIS</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>01 Jan 2024</TableCell>
                    <TableCell>
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        Pengeluaran
                      </Badge>
                    </TableCell>
                    <TableCell>Gaji</TableCell>
                    <TableCell>Gaji karyawan bulanan</TableCell>
                    <TableCell className="text-red-600 font-semibold">-Rp 5.000.000</TableCell>
                    <TableCell>Transfer</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>31 Des 2023</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Pemasukan
                      </Badge>
                    </TableCell>
                    <TableCell>Top-up</TableCell>
                    <TableCell>Top-up modal</TableCell>
                    <TableCell className="text-green-600 font-semibold">+Rp 10.000.000</TableCell>
                    <TableCell>Transfer</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rekonsiliasi Transaksi</CardTitle>
              <CardDescription>
                Rekonsiliasi transaksi pembayaran dengan statement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Status Rekonsiliasi</p>
                  <p className="text-sm text-muted-foreground">Januari 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">950 / 955</p>
                  <p className="text-sm text-muted-foreground">Matched</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Unmatched Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Sistem</TableHead>
                      <TableHead>Statement</TableHead>
                      <TableHead>Selisih</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>01 Jan 2024</TableCell>
                      <TableCell>Rp 100.000</TableCell>
                      <TableCell>Rp 100.000</TableCell>
                      <TableCell>Rp 0</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Match</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
              <CardDescription>
                Arus kas bulanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Chart akan ditampilkan di sini</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


