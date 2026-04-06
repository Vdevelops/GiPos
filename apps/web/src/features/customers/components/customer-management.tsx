"use client"

import { useState } from "react"
import { Plus, Search, Star, Crown, Award, Users, Gift, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CustomerManagement() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock customers
  const customers = [
    {
      id: 1,
      name: "Budi Santoso",
      phone: "0812-3456-7890",
      email: "budi@email.com",
      totalSpent: 2500000,
      points: 250,
      tier: "Gold",
      lastPurchase: "2 hari lalu",
      transactions: 45,
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      phone: "0813-4567-8901",
      email: "siti@email.com",
      totalSpent: 1200000,
      points: 120,
      tier: "Silver",
      lastPurchase: "1 minggu lalu",
      transactions: 20,
    },
    {
      id: 3,
      name: "Andi Wijaya",
      phone: "0814-5678-9012",
      email: "andi@email.com",
      totalSpent: 500000,
      points: 50,
      tier: "Bronze",
      lastPurchase: "3 hari lalu",
      transactions: 8,
    },
  ]

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Gold":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "Silver":
        return <Award className="h-4 w-4 text-gray-400" />
      default:
        return <Star className="h-4 w-4 text-orange-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Gold":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "Silver":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      default:
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pelanggan</h1>
          <p className="text-muted-foreground">
            Kelola data pelanggan dan program loyalty
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Pelanggan</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          <TabsTrigger value="tiers">Tier Member</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pelanggan (nama, HP, email)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Customers List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/avatars/${customer.id}.jpg`} />
                      <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{customer.name}</CardTitle>
                      <CardDescription>{customer.phone}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Belanja</span>
                    <span className="font-semibold">Rp {customer.totalSpent.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Poin</span>
                    <Badge variant="secondary" className="gap-1">
                      <Gift className="h-3 w-3" />
                      {customer.points}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tier</span>
                    <Badge className={getTierColor(customer.tier)}>
                      {getTierIcon(customer.tier)}
                      <span className="ml-1">{customer.tier}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Transaksi</span>
                    <span className="text-sm font-medium">{customer.transactions}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Terakhir</span>
                    <span className="text-sm">{customer.lastPurchase}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aturan Loyalty Program</CardTitle>
              <CardDescription>
                Konfigurasi sistem poin dan reward
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Poin Accrue</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="radio" name="accrue" defaultChecked />
                    <span className="text-sm">1 rupiah = 0.01 poin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="accrue" />
                    <span className="text-sm">1 transaksi = 10 poin</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Poin Redeem</label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={100} className="w-24" />
                  <span className="text-sm">poin = Rp</span>
                  <Input type="number" defaultValue={10000} className="w-32" />
                  <span className="text-sm">diskon</span>
                </div>
              </div>
              <Button>Simpan Perubahan</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History Poin</CardTitle>
              <CardDescription>
                Riwayat transaksi poin pelanggan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Budi Santoso</TableCell>
                    <TableCell>01 Jan 2024</TableCell>
                    <TableCell>
                      <Badge variant="default">Accrue</Badge>
                    </TableCell>
                    <TableCell>+10</TableCell>
                    <TableCell>250</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Siti Nurhaliza</TableCell>
                    <TableCell>31 Des 2023</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Redeem</Badge>
                    </TableCell>
                    <TableCell>-50</TableCell>
                    <TableCell>120</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  <CardTitle>Bronze</CardTitle>
                </div>
                <CardDescription>Total belanja &lt; Rp 1.000.000</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Diskon</span>
                  <Badge>5%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Poin Multiplier</span>
                  <Badge>1x</Badge>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">1 pelanggan</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gray-400" />
                  <CardTitle>Silver</CardTitle>
                </div>
                <CardDescription>Total belanja Rp 1.000.000 - 5.000.000</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Diskon</span>
                  <Badge>10%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Poin Multiplier</span>
                  <Badge>1.5x</Badge>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">1 pelanggan</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Gold</CardTitle>
                </div>
                <CardDescription>Total belanja &gt; Rp 5.000.000</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Diskon</span>
                  <Badge>15%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Poin Multiplier</span>
                  <Badge>2x</Badge>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">1 pelanggan</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


