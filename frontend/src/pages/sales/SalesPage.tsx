import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { salesApi } from '@/api/sales';
import { productsApi } from '@/api/products';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate } from '@/lib/utils';

const saleSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
});

type SaleForm = z.infer<typeof saleSchema>;

export default function SalesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await salesApi.getAll();
      if (!res.data) throw new Error('No data received');
      return res.data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productsApi.getAll();
      if (!res.data) throw new Error('No data received');
      return res.data;
    },
  });

  const paginatedSales = useMemo(() => {
    if (!sales) return [];
    const start = (page - 1) * pageSize;
    return sales.slice(start, start + pageSize);
  }, [sales, page, pageSize]);

  const createMutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      closeDialog();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SaleForm>({
    resolver: zodResolver(saleSchema),
  });

  const watchedProductId = watch('productId');
  const watchedQuantity = watch('quantity') || 0;

  const productOptions = (products || [])
    .filter((p) => p.quantity > 0)
    .map((p) => ({
      value: p.id,
      label: `${p.name} (Stock: ${p.quantity})`,
    }));

  const selectedProduct = (products || []).find((p) => p.id === watchedProductId);
  const total = selectedProduct ? selectedProduct.price * watchedQuantity : 0;

  const openDialog = () => {
    reset({ productId: '', quantity: 1 });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    reset();
  };

  const onSubmit = (data: SaleForm) => {
    createMutation.mutate({
      productId: data.productId,
      quantity: data.quantity,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Record and view sales transactions</p>
        </div>
        <Button onClick={openDialog} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">New Sale</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sales History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {salesLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading sales...</p>
          ) : !sales || sales.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No sales recorded yet.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="hidden sm:table-cell">Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.productName}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatCurrency(sale.unitPrice)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(sale.totalAmount)}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(sale.soldAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                page={page}
                pageSize={pageSize}
                totalItems={sales.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* New Sale Dialog */}
      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {createMutation.isError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {(createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to record sale'}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="productId">Product</Label>
            <Select
              id="productId"
              options={productOptions}
              placeholder="Select a product"
              {...register('productId')}
            />
            {errors.productId && (
              <p className="text-sm text-destructive">{errors.productId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={selectedProduct?.quantity || undefined}
              {...register('quantity')}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
            {selectedProduct && (
              <p className="text-xs text-muted-foreground">
                Available stock: {selectedProduct.quantity}
              </p>
            )}
          </div>

          {watchedProductId && watchedQuantity > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Record Sale
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
