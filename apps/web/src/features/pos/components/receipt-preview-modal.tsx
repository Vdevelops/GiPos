'use client';

import { useState, useEffect } from 'react';
import {
  Printer,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Bluetooth,
  BluetoothOff,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { isBluetoothSupported, testBluetoothPrinterConnection } from '@/lib/bluetooth-printer';
import { toast } from '@/lib/toast';
import type { CartItem } from './pos-cart';

export interface ReceiptPreviewData {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  total: number;
  paymentMethod: 'cash' | 'qris';
  amountPaid: number;
  change: number;
  cashierName: string;
  orderNumber: string;
  date: string;
  time: string;
}

interface ReceiptPreviewModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly data: ReceiptPreviewData | null;
  readonly onConfirmPrint: (mode?: 'bluetooth' | 'browser') => Promise<void>;
  readonly onCancel: () => void;
  readonly isProcessing?: boolean;
}

export function ReceiptPreviewModal({
  open,
  onOpenChange,
  data,
  onConfirmPrint,
  onCancel,
  isProcessing = false,
}: ReceiptPreviewModalProps) {
  const [isTestingPrinter, setIsTestingPrinter] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [hasBluetoothSupport, setHasBluetoothSupport] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      setHasBluetoothSupport(isBluetoothSupported());
    }
  }, [open]);

  const handleTestConnection = async () => {
    setIsTestingPrinter(true);
    try {
      const result = await testBluetoothPrinterConnection();
      if (result.success) {
        setConnectedDevice(result.deviceName || 'Printer Thermal');
        toast.success(`Printer "${result.deviceName || 'Thermal'}" terhubung & siap cetak!`);
      } else {
        toast.error(`Koneksi Printer Gagal: ${result.error}`);
      }
    } catch {
      toast.error('Gagal menguji koneksi printer');
    } finally {
      setIsTestingPrinter(false);
    }
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[92dvh] overflow-y-auto p-4 sm:max-w-md md:p-6">
        <DialogHeader className="pb-2 text-center">
          <DialogTitle className="text-center text-xl font-bold">Preview Nota Pembayaran</DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Periksa tampilan nota 58mm sebelum mencetak dan memproses transaksi.
          </DialogDescription>
        </DialogHeader>

        {/* Printer Device Connection Indicator Box */}
        <div className="rounded-lg border p-3 bg-muted/30 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasBluetoothSupport ? (
                <Bluetooth className="h-4 w-4 text-blue-500" />
              ) : (
                <BluetoothOff className="h-4 w-4 text-amber-500" />
              )}
              <span className="font-semibold text-foreground">Status Printer Bluetooth:</span>
            </div>

            {hasBluetoothSupport ? (
              <Badge variant={connectedDevice ? 'default' : 'outline'} className="gap-1 text-[10px] py-0.5">
                {connectedDevice ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    {connectedDevice}
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-3 w-3 text-blue-500" />
                    Siap Dipilih Saat Cetak
                  </>
                )}
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 text-[10px] py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                <AlertTriangle className="h-3 w-3" />
                Tidak Didukung di Browser Ini
              </Badge>
            )}
          </div>

          {/* Additional Info / Action */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <span>
              {hasBluetoothSupport
                ? connectedDevice
                  ? 'Koneksi perangkat terverifikasi.'
                  : 'Klik Cetak Bluetooth untuk menghubungkan.'
                : 'Menggunakan Driver Printer OS / CUPS Linux.'}
            </span>

            {hasBluetoothSupport && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] font-medium text-primary hover:text-primary/90"
                onClick={handleTestConnection}
                disabled={isTestingPrinter || isProcessing}
              >
                {isTestingPrinter ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Mencoba...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Tes Printer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Thermal Receipt Paper Card */}
        <div
          id="printable-thermal-receipt"
          className="mx-auto w-full max-w-[340px] rounded-lg border border-stone-300 bg-stone-50 p-5 font-mono text-xs text-stone-900 shadow-md leading-relaxed dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        >
          {/* Header */}
          <div className="text-center space-y-1.5 pb-1">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide leading-tight text-stone-950 dark:text-white">
              Warung Bebek &amp; Ayam Goreng Wanamukti
            </h2>
            <p className="text-[11px] text-stone-600 dark:text-stone-300">Jl. Wanamukti No. 88, Semarang</p>
          </div>

          <div className="my-3 border-b border-dashed border-stone-400 dark:border-stone-600" />

          {/* Transaction Metadata */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span>Tanggal</span>
              <span className="font-semibold">{data.date} {data.time}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir</span>
              <span className="font-semibold">{data.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>No. Order</span>
              <span className="font-semibold">{data.orderNumber}</span>
            </div>
          </div>

          <div className="my-3 border-b border-dashed border-stone-400 dark:border-stone-600" />

          {/* Menu items */}
          <div className="space-y-3 py-1">
            {data.items.map((item, index) => {
              const unitPrice = item.product?.price ?? 0;
              const lineTotal = unitPrice * (item.quantity ?? 0);
              return (
                <div key={item.product?.id ?? index} className="space-y-1">
                  <p className="font-bold text-stone-950 dark:text-stone-50 leading-snug text-[12px]">
                    {item.product?.name ?? 'Produk'}
                  </p>
                  <div className="flex justify-between text-[11px] text-stone-600 dark:text-stone-300">
                    <span>
                      {item.quantity} x {formatCurrency(unitPrice)}
                    </span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="my-3 border-b border-dashed border-stone-400 dark:border-stone-600" />

          {/* Subtotal & Discount */}
          <div className="space-y-1.5 text-[11px]">
            {data.discountAmount > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(data.subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Diskon ({data.discountPercent}%)</span>
                  <span>-{formatCurrency(data.discountAmount)}</span>
                </div>
              </>
            )}

            {/* Total */}
            <div className="flex justify-between pt-1 text-sm font-black text-stone-950 dark:text-stone-50">
              <span>TOTAL</span>
              <span>{formatCurrency(data.total)}</span>
            </div>

            {/* Payment method details */}
            <div className="my-2 border-t border-dashed border-stone-300 dark:border-stone-700 pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Metode Bayar</span>
                <span className="font-bold uppercase">{data.paymentMethod}</span>
              </div>
              {data.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Uang Diterima</span>
                    <span>{formatCurrency(data.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Kembalian</span>
                    <span className={data.change < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
                      {formatCurrency(data.change)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="my-3 border-b border-dashed border-stone-400 dark:border-stone-600" />

          {/* Footer Note */}
          <div className="pt-1.5 text-center space-y-0.5">
            <p className="text-[11px] font-bold tracking-wide">Terima Kasih</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">Atas Kunjungan Anda</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="h-11 px-4 text-sm font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Batal
          </Button>

          <Button
            type="button"
            onClick={() => void onConfirmPrint('browser')}
            disabled={isProcessing}
            className="h-11 flex-1 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Simpan &amp; Cetak Nota
              </>
            )}
          </Button>

          {hasBluetoothSupport && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void onConfirmPrint('bluetooth')}
              disabled={isProcessing}
              className="h-11 text-xs font-semibold"
            >
              Bluetooth Direct
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


