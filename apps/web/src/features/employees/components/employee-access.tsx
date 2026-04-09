"use client"

import { Plus, Clock, XCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

export function EmployeeAccess() {
  // Mock employees
  const employees = [
    {
      id: 1,
      name: "Budi Santoso",
      email: "budi@email.com",
      role: "Kasir",
      outlet: "Cabang A",
      status: "aktif",
      joinedDate: "Jan 2024",
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      email: "siti@email.com",
      role: "Manager",
      outlet: "Semua",
      status: "aktif",
      joinedDate: "Dec 2023",
    },
    {
      id: 3,
      name: "Andi Wijaya",
      email: "andi@email.com",
      role: "Kasir",
      outlet: "Cabang B",
      status: "aktif",
      joinedDate: "Nov 2023",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Karyawan & Hak Akses</h1>
          <p className="text-muted-foreground">
            Kelola karyawan, role, dan permission
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Karyawan
        </Button>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Karyawan</TabsTrigger>
          <TabsTrigger value="roles">Role & Permission</TabsTrigger>
          <TabsTrigger value="shifts">Shift Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Karyawan</CardTitle>
              <CardDescription>
                {employees.length} karyawan aktif
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={`/avatars/${employee.id}.jpg`} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-muted-foreground">{employee.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{employee.role}</Badge>
                              <Badge variant="secondary">{employee.outlet}</Badge>
                              <Badge variant={employee.status === "aktif" ? "default" : "secondary"}>
                                {employee.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Bergabung</p>
                          <p className="text-sm font-medium">{employee.joinedDate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role & Permission</CardTitle>
              <CardDescription>
                Konfigurasi hak akses per role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Kasir</h3>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">POS Core - Create Sale</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">POS Core - Refund</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">Produk - Read</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Produk - Create/Update/Delete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Laporan - View</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Manager</h3>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">Semua akses Kasir</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">Produk - Full Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">Laporan - View & Export</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">Approve Refund/Diskon</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift Management</CardTitle>
              <CardDescription>
                Kelola shift kerja kasir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Saldo Awal</TableHead>
                    <TableHead>Saldo Akhir</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Budi Santoso</TableCell>
                    <TableCell>01 Jan 2024</TableCell>
                    <TableCell>Rp 1.000.000</TableCell>
                    <TableCell>Rp 3.500.000</TableCell>
                    <TableCell>Rp 0</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Closed
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Siti Nurhaliza</TableCell>
                    <TableCell>01 Jan 2024</TableCell>
                    <TableCell>Rp 1.000.000</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Open
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Log aktivitas semua karyawan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>10:00</TableCell>
                    <TableCell>Budi</TableCell>
                    <TableCell>Create</TableCell>
                    <TableCell>Sale</TableCell>
                    <TableCell>Transaksi #1001</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>09:30</TableCell>
                    <TableCell>Siti</TableCell>
                    <TableCell>Update</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Produk A - Harga diubah</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>09:00</TableCell>
                    <TableCell>Andi</TableCell>
                    <TableCell>Refund</TableCell>
                    <TableCell>Sale</TableCell>
                    <TableCell>Transaksi #1000 - Disetujui</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


