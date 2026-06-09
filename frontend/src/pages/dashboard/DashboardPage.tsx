import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsApi } from '@/api/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await reportsApi.getDashboard();
      if (!res.data) throw new Error('No data received');
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading dashboard...</div>;
  }

  if (!data) return null;

  const stats = [
    {
      title: 'Total Products',
      value: data.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Current Stock',
      value: data.totalStock,
      icon: BarChart3,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: "Today's Sales",
      value: data.todaySales,
      icon: ShoppingCart,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const chartData = data.dailySales.map((d) => ({
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    revenue: d.revenue,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Overview of your inventory and sales</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bg} shrink-0`}>
                  <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Revenue — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }}
                    axisLine={{ stroke: 'hsl(214, 32%, 91%)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(214, 32%, 91%)',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentSales.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No sales recorded yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.productName}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(sale.totalAmount)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(sale.soldAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
