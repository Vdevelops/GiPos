"use client"

import { HelpCircle, Book, MessageCircle, Video, FileText, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bantuan & Dukungan</h1>
        <p className="text-muted-foreground">
          Temukan jawaban dan dapatkan bantuan
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari bantuan..."
          className="pl-10 h-12"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Book className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Dokumentasi</CardTitle>
            <CardDescription>
              Panduan lengkap penggunaan GiPos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Buka Dokumentasi
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Video className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Video Tutorial</CardTitle>
            <CardDescription>
              Pelajari cara menggunakan fitur-fitur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Tonton Video
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageCircle className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>
              Chat langsung dengan tim support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Mulai Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>FAQ</CardTitle>
            <CardDescription>
              Pertanyaan yang sering diajukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Lihat FAQ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <HelpCircle className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Panduan Cepat</CardTitle>
            <CardDescription>
              Quick start guide untuk pemula
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Baca Panduan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageCircle className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Kontak Support</CardTitle>
            <CardDescription>
              Hubungi tim support kami
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Hubungi Kami
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topik Populer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              Cara membuat transaksi pertama
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Mengelola produk dan stok
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Setup payment gateway
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Integrasi dengan marketplace
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Mengatur karyawan dan akses
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


