'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Clock, DollarSign, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useShifts, useOpenShift, useCloseShift } from '../hooks/use-shifts';
import { ShiftOpenDialog } from './shift-open-dialog';
import { ShiftCloseDialog } from './shift-close-dialog';
import { formatCurrency } from '@/lib/currency';
import { rupiahToSen } from '@/lib/currency';

export function ShiftManagement() {
  const t = useTranslations('pos');
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [closingShiftId, setClosingShiftId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data: shiftsData, isLoading } = useShifts({
    page,
    per_page: perPage,
    sort_by: 'opening_time',
    sort_order: 'desc',
  });

  const shifts = shiftsData?.data ?? [];
  const pagination = shiftsData?.meta?.pagination;

  // Find open shift
  const openShift = shifts.find((shift) => shift?.status === 'open');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('shiftManagement')}</h1>
          <p className="text-muted-foreground">
            {t('shiftManagementDesc')}
          </p>
        </div>
        {!openShift && (
          <Button onClick={() => setShowOpenDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('openShift')}
          </Button>
        )}
      </div>

      {/* Current Shift Status */}
      {openShift && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t('currentShift')}
                </CardTitle>
                <CardDescription>
                  {t('shiftNumber')}: {openShift?.shift_number ?? '-'}
                </CardDescription>
              </div>
              <Badge variant="default" className="text-lg px-3 py-1">
                {t('open')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('openingCash')}</p>
                <p className="text-xl font-bold">{formatCurrency(openShift?.opening_cash ?? 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('totalSales')}</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(openShift?.total_sales ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('totalTransactions')}</p>
                <p className="text-xl font-bold">{openShift?.total_transactions ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('expectedCash')}</p>
                <p className="text-xl font-bold">
                  {formatCurrency(openShift?.expected_cash ?? 0)}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setClosingShiftId(openShift?.id ?? null)}
              >
                {t('closeShift')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shift History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('shiftHistory')}</CardTitle>
          <CardDescription>
            {pagination?.total ?? 0} {t('shiftsFound')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : shifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noShifts')}</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('openFirstShift')}
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('shiftNumber')}</TableHead>
                    <TableHead>{t('openingTime')}</TableHead>
                    <TableHead>{t('closingTime')}</TableHead>
                    <TableHead>{t('totalSales')}</TableHead>
                    <TableHead>{t('transactions')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => {
                    const status = shift?.status ?? 'closed';
                    const isOpen = status === 'open';

                    return (
                      <TableRow key={shift?.id ?? 'unknown'}>
                        <TableCell className="font-mono">
                          {shift?.shift_number ?? '-'}
                        </TableCell>
                        <TableCell>
                          {shift?.opening_time
                            ? new Date(shift.opening_time).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {shift?.closing_time
                            ? new Date(shift.closing_time).toLocaleString()
                            : isOpen
                            ? '-'
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(shift?.total_sales ?? 0)}
                        </TableCell>
                        <TableCell>{shift?.total_transactions ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant={isOpen ? 'default' : 'secondary'}>
                            {isOpen ? t('open') : t('closed')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.total_pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.has_prev || page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.has_next || page === pagination.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ShiftOpenDialog
        open={showOpenDialog}
        onOpenChange={setShowOpenDialog}
      />

      {closingShiftId && (
        <ShiftCloseDialog
          open={!!closingShiftId}
          onOpenChange={(open) => {
            if (!open) setClosingShiftId(null);
          }}
          shiftId={closingShiftId}
        />
      )}
    </div>
  );
}
