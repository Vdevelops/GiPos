'use client';

import { useState } from 'react';
import { CreditCard, QrCode, Wallet, Banknote, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, rupiahToSen } from '@/lib/currency';
import type { CartItem } from './pos-cart';

interface PaymentModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly items: CartItem[];
  readonly total: number; // in sen
  readonly taxable?: boolean;
  readonly onPayment: (method: string, data: Record<string, unknown>) => void | Promise<void>;
  readonly isLoading?: boolean;
}

type PaymentMethod = 'cash' | 'qris' | 'e_wallet' | 'transfer' | 'card';

export function PaymentModal({
  open,
  onOpenChange,
  items,
  total,
  taxable = true,
  onPayment,
  isLoading = false,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [eWalletType, setEWalletType] = useState<'gopay' | 'ovo' | 'shopee_pay' | 'dana' | null>(null);
  const [bankName, setBankName] = useState<string>('');

  const handlePayment = async () => {
    if (!selectedMethod) return;

    const paymentData: Record<string, unknown> = {
      method: selectedMethod,
      amount: total,
    };

    if (selectedMethod === 'cash') {
      const cashAmount = rupiahToSen(parseFloat(cashReceived) || 0);
      if (cashAmount < total) {
        // Error: cash received less than total
        return;
      }
      paymentData.cash_received = cashAmount;
    } else if (selectedMethod === 'e_wallet') {
      if (!eWalletType) return;
      paymentData.e_wallet_type = eWalletType;
    } else if (selectedMethod === 'transfer') {
      paymentData.bank_name = bankName || null;
    }

    try {
      await onPayment(selectedMethod, paymentData);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const cashAmount = parseFloat(cashReceived) || 0;
  const cashAmountSen = rupiahToSen(cashAmount);
  const change = cashAmountSen - total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
          <DialogDescription>
            Total: {formatCurrency(total)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Method Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedMethod === 'cash' ? 'default' : 'outline'}
              className="h-20 flex flex-col gap-2"
              onClick={() => setSelectedMethod('cash')}
            >
              <Banknote className="h-6 w-6" />
              <span>Cash</span>
            </Button>
            <Button
              variant={selectedMethod === 'qris' ? 'default' : 'outline'}
              className="h-20 flex flex-col gap-2"
              onClick={() => setSelectedMethod('qris')}
            >
              <QrCode className="h-6 w-6" />
              <span>QRIS</span>
            </Button>
            <Button
              variant={selectedMethod === 'e_wallet' ? 'default' : 'outline'}
              className="h-20 flex flex-col gap-2"
              onClick={() => setSelectedMethod('e_wallet')}
            >
              <Wallet className="h-6 w-6" />
              <span>E-Wallet</span>
            </Button>
            <Button
              variant={selectedMethod === 'transfer' ? 'default' : 'outline'}
              className="h-20 flex flex-col gap-2"
              onClick={() => setSelectedMethod('transfer')}
            >
              <CreditCard className="h-6 w-6" />
              <span>Transfer</span>
            </Button>
          </div>

          {/* Cash Payment Form */}
          {selectedMethod === 'cash' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="cash-received">Cash Received</Label>
                <Input
                  id="cash-received"
                  type="number"
                  placeholder="0"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="text-lg"
                />
              </div>
              {cashAmountSen >= total && (
                <div className="space-y-2">
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Change</span>
                    <span className="text-green-600">
                      {formatCurrency(change)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* E-Wallet Selection */}
          {selectedMethod === 'e_wallet' && (
            <div className="space-y-2 p-4 border rounded-lg">
              <Label>Select E-Wallet</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['gopay', 'ovo', 'shopee_pay', 'dana'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={eWalletType === type ? 'default' : 'outline'}
                    onClick={() => setEWalletType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Transfer Form */}
          {selectedMethod === 'transfer' && (
            <div className="space-y-2 p-4 border rounded-lg">
              <Label htmlFor="bank-name">Bank Name (Optional)</Label>
              <Input
                id="bank-name"
                placeholder="BCA, Mandiri, BNI, etc."
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                void handlePayment();
              }}
              disabled={
                isLoading ||
                !selectedMethod ||
                (selectedMethod === 'cash' && cashAmountSen < total) ||
                (selectedMethod === 'e_wallet' && !eWalletType)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
