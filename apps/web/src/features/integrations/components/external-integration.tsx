"use client"

import { CheckCircle2, XCircle, Copy, Key, Webhook, ShoppingBag, CreditCard, Printer, Scan } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ExternalIntegration() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrasi Eksternal</h1>
        <p className="text-muted-foreground">
          Kelola API, marketplace, payment gateway, dan hardware
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Publik</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key</CardTitle>
              <CardDescription>
                Gunakan API key untuk akses API publik
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value="gipos_sk_live_1234567890abcdef"
                  readOnly
                  className="font-mono"
                />
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline">Regenerate</Button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Rate Limit: </span>
                  <span className="font-medium">1,000 / 10,000 per hari</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Usage: </span>
                  <span className="font-medium">250 / 1,000 hari ini</span>
                </div>
              </div>
              <Button variant="outline">
                <Key className="mr-2 h-4 w-4" />
                View Documentation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Konfigurasi webhook untuk notifikasi event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">https://example.com/webhook</p>
                    <p className="text-sm text-muted-foreground">sale.created, sale.completed</p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
              <Button variant="outline">
                <Webhook className="mr-2 h-4 w-4" />
                Add Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tokopedia</CardTitle>
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <CardDescription>
                  Sync produk dan order dengan Tokopedia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sync Frequency</span>
                    <span className="font-medium">Real-time</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Produk Ter-sync</span>
                    <span className="font-medium">50 produk</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Order Ter-import</span>
                    <span className="font-medium">12 order</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Sync Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Shopee</CardTitle>
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                </div>
                <CardDescription>
                  Sync produk dan order dengan Shopee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Connect Shopee
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Xendit</CardTitle>
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <CardDescription>
                  Payment gateway untuk QRIS & E-wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">QRIS</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">E-Wallet</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Midtrans</CardTitle>
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Configured
                  </Badge>
                </div>
                <CardDescription>
                  Backup payment gateway
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Configure Midtrans
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hardware" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Printer</CardTitle>
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <CardDescription>
                  Bluetooth Printer - Epson TM-T20
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">Bluetooth</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Printer className="mr-2 h-4 w-4" />
                    Test Print
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Barcode Scanner</CardTitle>
                  <Badge variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <CardDescription>
                  USB Scanner - Symbol LS2208
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">USB</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Scan className="mr-2 h-4 w-4" />
                    Test Scan
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


