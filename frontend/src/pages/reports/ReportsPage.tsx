import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Package, DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';
import { reportsApi } from '@/api/reports';
import { productsApi } from '@/api/products';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate, downloadCSV } from '@/lib/utils';

type ReportTab = 'stock' | 'sales';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('stock');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productId, setProductId] = useState('');
  const [stockPage, setStockPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(10);
  const [salesPage, setSalesPage] = useState(1);
  const [salesPageSize, setSalesPageSize] = useState(10);

  const { data: stockReport, isLoading: stockLoading } = useQuery({
    queryKey: ['stockReport'],
    queryFn: async () => {
      const res = await reportsApi.getStockReport();
      if (!res.data) throw new Error('No data received');
      return res.data;
    },
    enabled: activeTab === 'stock',
  });

  const { data: salesReport, isLoading: salesLoading } = useQuery({
    queryKey: ['salesReport', startDate, endDate, productId],
    queryFn: async () => {
      const res = await reportsApi.getSalesReport(
        startDate || undefined,
        endDate || undefined,
        productId || undefined
      );
      if (!res.data) throw new Error('No data received');
      return res.data;
    },
    enabled: activeTab === 'sales',
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productsApi.getAll();
      if (!res.data) throw new Error('No data received');
      return res.data;
    },
    enabled: activeTab === 'sales',
  });

  const productOptions = [
    { value: '', label: 'All Products' },
    ...(products || []).map((p) => ({ value: p.id, label: p.name })),
  ];

  const paginatedStock = useMemo(() => {
    if (!stockReport) return [];
    const start = (stockPage - 1) * stockPageSize;
    return stockReport.products.slice(start, start + stockPageSize);
  }, [stockReport, stockPage, stockPageSize]);

  const paginatedSales = useMemo(() => {
    if (!salesReport) return [];
    const start = (salesPage - 1) * salesPageSize;
    return salesReport.sales.slice(start, start + salesPageSize);
  }, [salesReport, salesPage, salesPageSize]);

  // Stock report stats
  const stockStats = useMemo(() => {
    if (!stockReport) return null;
    const totalValue = stockReport.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const lowStockCount = stockReport.products.filter((p) => p.quantity < 10).length;
    return {
      totalProducts: stockReport.totalProducts,
      totalStock: stockReport.totalStock,
      totalValue,
      lowStockCount,
    };
  }, [stockReport]);

  // Sales report stats
  const salesStats = useMemo(() => {
    if (!salesReport) return null;
    const avgSale = salesReport.totalSales > 0 ? salesReport.totalRevenue / salesReport.totalSales : 0;
    const totalItems = salesReport.sales.reduce((sum, s) => sum + s.quantity, 0);
    return {
      totalSales: salesReport.totalSales,
      totalRevenue: salesReport.totalRevenue,
      avgSale,
      totalItems,
    };
  }, [salesReport]);

  const exportStockCSV = () => {
    if (!stockReport) return;
    downloadCSV(
      'stock-report.csv',
      ['Name', 'Category', 'Price', 'Quantity', 'Value'],
      stockReport.products.map((p) => [
        p.name,
        p.category,
        p.price.toFixed(2),
        String(p.quantity),
        (p.price * p.quantity).toFixed(2),
      ])
    );
  };

  const exportSalesCSV = () => {
    if (!salesReport) return;
    downloadCSV(
      'sales-report.csv',
      ['Product', 'Quantity', 'Unit Price', 'Total', 'Date'],
      salesReport.sales.map((s) => [
        s.productName,
        String(s.quantity),
        s.unitPrice.toFixed(2),
        s.totalAmount.toFixed(2),
        formatDate(s.soldAt),
      ])
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">View stock levels and sales analytics</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'stock' ? 'default' : 'outline'}
          onClick={() => setActiveTab('stock')}
          size="sm"
        >
          Stock Report
        </Button>
        <Button
          variant={activeTab === 'sales' ? 'default' : 'outline'}
          onClick={() => setActiveTab('sales')}
          size="sm"
        >
          Sales Report
        </Button>
      </div>

      {/* Stock Report */}
      {activeTab === 'stock' && (
        <>
          {/* Stat Cards */}
          {stockStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 shrink-0">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">Total Products</p>
                      <p className="text-lg font-bold text-gray-900">{stockStats.totalProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 shrink-0">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">Total Stock</p>
                      <p className="text-lg font-bold text-gray-900">{stockStats.totalStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50 shrink-0">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">Total Value</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(stockStats.totalValue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-50 shrink-0">
                      <Badge variant="destructive" className="text-[10px] px-1.5">!</Badge>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">Low Stock</p>
                      <p className="text-lg font-bold text-gray-900">{stockStats.lowStockCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg">Stock Report</CardTitle>
                <Button variant="outline" size="sm" onClick={exportStockCSV} disabled={!stockReport}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {stockLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : !stockReport || stockReport.products.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No products in inventory</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="hidden md:table-cell">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStock.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant={product.category === 'Fruits' ? 'default' : 'secondary'}>
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>
                            <span className={product.quantity < 10 ? 'text-destructive font-semibold' : ''}>
                              {product.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell font-semibold">
                            {formatCurrency(product.price * product.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination
                    page={stockPage}
                    pageSize={stockPageSize}
                    totalItems={stockReport.products.length}
                    onPageChange={setStockPage}
                    onPageSizeChange={setStockPageSize}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Sales Report */}
      {activeTab === 'sales' && (
        <>
          {/* Stat Cards */}
          {salesStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50 shrink-0">
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">Total Sales</p>
                      <p className="text-lg font-bold text-gray-900">{salesStats.totalSales}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 shrink-0">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">Total Revenue</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(salesStats.totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 shrink-0">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">Avg. Sale</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(salesStats.avgSale)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 shrink-0">
                      <Package className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">Items Sold</p>
                      <p className="text-lg font-bold text-gray-900">{salesStats.totalItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg">Sales Report</CardTitle>
                <Button variant="outline" size="sm" onClick={exportSalesCSV} disabled={!salesReport}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setSalesPage(1); }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endDate" className="text-xs">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setSalesPage(1); }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1 min-w-[160px]">
                  <Label htmlFor="productFilter" className="text-xs">Product</Label>
                  <Select
                    id="productFilter"
                    value={productId}
                    onChange={(e) => { setProductId(e.target.value); setSalesPage(1); }}
                    options={productOptions}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setStartDate(''); setEndDate(''); setProductId(''); setSalesPage(1); }}
                >
                  Clear
                </Button>
              </div>

              {/* Sales Table */}
              {salesLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : !salesReport || salesReport.sales.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No sales found for this period</p>
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
                    page={salesPage}
                    pageSize={salesPageSize}
                    totalItems={salesReport.sales.length}
                    onPageChange={setSalesPage}
                    onPageSizeChange={setSalesPageSize}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
