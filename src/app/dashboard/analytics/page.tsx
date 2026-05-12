'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useUserStore } from '@/lib/store/user-store';
import { reportsService, salesService } from '@/lib/api/services/wallet';
import { clientsService } from '@/lib/api/services/base-operations';
import type { ClientReport, SalesReport, VoucherSale, TopUser, Pagination } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Download,
  Smartphone,
  Ticket,
  Trophy,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from '@/components/common';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from 'recharts';
import { cn } from '@/lib/utils';

const chartConfig: ChartConfig = {
  amount: { label: 'Sales', color: 'hsl(var(--primary))' },
  count: { label: 'Transactions', color: 'hsl(var(--accent))' },
};

const providerColors = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(220 70% 50%)',
  'hsl(280 70% 50%)',
  'hsl(var(--muted-foreground))',
];

const rangeLabel = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
} as const;

type SalesTabValue = 'all' | 'mobile' | 'direct';

interface SalesPage {
  data: VoucherSale[];
  pagination: Pagination;
}

function PaginationControl({ pagination, onPage }: { pagination: Pagination; onPage: (p: number) => void }) {
  if (pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t">
      <p className="text-sm text-muted-foreground">
        Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => onPage(pagination.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          const start = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4));
          const p = start + i;
          return (
            <Button
              key={p}
              variant={p === pagination.page ? 'default' : 'outline'}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => onPage(p)}
            >
              {p}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPage(pagination.page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useUserStore();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [clientReport, setClientReport] = useState<ClientReport | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SalesTabValue>('all');

  // Per-tab paged data
  const [allSales, setAllSales] = useState<SalesPage>({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
  const [mobileSales, setMobileSales] = useState<SalesPage>({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
  const [directSales, setDirectSales] = useState<SalesPage>({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
  const [tabLoading, setTabLoading] = useState(false);

  const clientId = user?.client_id;

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    Promise.all([
      reportsService.getSalesReport(clientId),
      clientsService.getReport(clientId),
      reportsService.getTopUsers(clientId, { limit: 10 }),
    ])
      .then(([salesData, reportData, users]) => {
        setSalesReport(salesData);
        setClientReport(reportData);
        setTopUsers(users ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientId]);

  const fetchTab = useCallback(
    async (tab: SalesTabValue, page: number) => {
      if (!clientId) return;
      setTabLoading(true);
      try {
        const params = { page, limit: 20 };
        if (tab === 'all') {
          const result = await salesService.getAll(clientId, params);
          setAllSales(result);
        } else if (tab === 'mobile') {
          const result = await salesService.getMobileMoney(clientId, params);
          setMobileSales(result);
        } else {
          const result = await salesService.getDirect(clientId, params);
          setDirectSales(result);
        }
      } finally {
        setTabLoading(false);
      }
    },
    [clientId]
  );

  useEffect(() => {
    fetchTab(activeTab, 1);
  }, [activeTab, fetchTab]);

  const sales = salesReport?.sales ?? [];

  const filteredSales = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    start.setDate(start.getDate() - days);
    return sales.filter((s) => parseISO(s.createdAt) >= start);
  }, [sales, timeRange]);

  const salesByDate = useMemo(() => {
    const map = new Map<string, { date: string; amount: number; count: number; iso: string }>();
    filteredSales.forEach((sale) => {
      const iso = format(parseISO(sale.createdAt), 'yyyy-MM-dd');
      const date = format(parseISO(sale.createdAt), 'MMM dd');
      const current = map.get(iso) ?? { date, amount: 0, count: 0, iso };
      current.amount += sale.amount;
      current.count += 1;
      map.set(iso, current);
    });
    return Array.from(map.values()).sort((a, b) => a.iso.localeCompare(b.iso));
  }, [filteredSales]);

  const providerDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach((sale) => {
      const provider = sale.provider || 'Unknown';
      counts[provider] = (counts[provider] ?? 0) + 1;
    });
    return Object.entries(counts).map(([provider, value], index) => ({
      name: provider,
      value,
      color: providerColors[index % providerColors.length],
    }));
  }, [sales]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.amount, 0);
  const totalNetRevenue = salesReport?.summary.netRevenue ?? salesReport?.summary.totalRevenue ?? 0;
  const averageSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  const currentTabSales = activeTab === 'all' ? allSales : activeTab === 'mobile' ? mobileSales : directSales;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (rank === 2) return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    if (rank === 3) return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Analytics
            </h1>
            <p className="text-muted-foreground">Sales performance and top customer rankings</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
              <SelectTrigger className="w-36">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(rangeLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" disabled={loading}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-3xl font-bold mt-1">
                  <AnimatedCounter value={salesReport?.summary.totalSales ?? 0} suffix="" />
                </p>
                <Badge className="mt-2 bg-green-500/10 text-green-500 border-green-500/20">{rangeLabel[timeRange]}</Badge>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Gross Revenue</p>
                <p className="text-3xl font-bold mt-1">UGX {totalRevenue.toLocaleString()}</p>
                <Badge className="mt-2 bg-green-500/10 text-green-500 border-green-500/20">Live</Badge>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Net Revenue</p>
                <p className="text-3xl font-bold mt-1">UGX {Number(totalNetRevenue).toLocaleString()}</p>
                <Badge className="mt-2 bg-blue-500/10 text-blue-500 border-blue-500/20">After fees</Badge>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Average Sale</p>
                <p className="text-3xl font-bold mt-1">UGX {averageSale.toFixed(0)}</p>
                <Badge className="mt-2 bg-green-500/10 text-green-500 border-green-500/20">
                  {filteredSales.length} transactions
                </Badge>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Revenue over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesByDate}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="url(#salesGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provider Distribution</CardTitle>
              <CardDescription>Sales split by mobile provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ChartContainer config={chartConfig} className="h-[250px] w-full max-w-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={providerDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                        {providerDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                {providerDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Summary</CardTitle>
              <CardDescription>Operational metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Active Vouchers</p>
                  <p className="text-2xl font-bold mt-1">{clientReport?.activeVouchers ?? '–'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Total Devices</p>
                  <p className="text-2xl font-bold mt-1">{clientReport?.totalDevices ?? '–'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Packages</p>
                  <p className="text-2xl font-bold mt-1">{clientReport?.activePackages ?? '–'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-bold mt-1">UGX {clientReport?.totalRevenue?.toLocaleString() ?? '–'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Users Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Customers
            </CardTitle>
            <CardDescription>
              Users ranked by total spending via mobile money purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No purchase data yet</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead className="text-right">Purchases</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead>Last Purchase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topUsers.map((u) => (
                      <TableRow key={u.phone} className={u.rank <= 3 ? 'bg-muted/30' : ''}>
                        <TableCell>
                          <Badge variant="outline" className={cn('font-bold', getRankBadge(u.rank))}>
                            {u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : `#${u.rank}`}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium font-mono">{u.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{u.provider || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{u.purchaseCount}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          UGX {Number(u.totalSpent).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {u.lastPurchase ? format(new Date(u.lastPurchase), 'MMM d, yyyy') : '–'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Breakdown Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Sales Breakdown
            </CardTitle>
            <CardDescription>View voucher sales by payment type with pagination</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SalesTabValue)}>
              <TabsList className="mb-4">
                <TabsTrigger value="all" className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  All Sales
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4" />
                  Mobile Money
                </TabsTrigger>
                <TabsTrigger value="direct" className="flex items-center gap-1.5">
                  <Ticket className="h-4 w-4" />
                  Direct Voucher
                </TabsTrigger>
              </TabsList>

              {(['all', 'mobile', 'direct'] as SalesTabValue[]).map((tab) => (
                <TabsContent key={tab} value={tab}>
                  {tabLoading && activeTab === tab ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : currentTabSales.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <Ticket className="h-10 w-10 mb-3 opacity-30" />
                      <p className="text-sm">No sales found</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-lg border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Voucher Code</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Service Fee</TableHead>
                              {tab !== 'direct' && <TableHead>Phone</TableHead>}
                              {tab !== 'direct' && <TableHead>Provider</TableHead>}
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentTabSales.data.map((sale) => (
                              <TableRow key={sale.id}>
                                <TableCell className="font-mono text-sm">{sale.voucherCode || '–'}</TableCell>
                                <TableCell className="font-medium">UGX {Number(sale.amount).toLocaleString()}</TableCell>
                                <TableCell className="text-muted-foreground">UGX {Number(sale.fee).toLocaleString()}</TableCell>
                                {tab !== 'direct' && <TableCell className="font-mono text-sm">{sale.phone || '–'}</TableCell>}
                                {tab !== 'direct' && (
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">{sale.provider || 'Unknown'}</Badge>
                                  </TableCell>
                                )}
                                <TableCell className="text-muted-foreground text-sm">
                                  {sale.createdAt ? format(parseISO(sale.createdAt), 'MMM d, yyyy h:mm a') : '–'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <PaginationControl
                        pagination={currentTabSales.pagination}
                        onPage={(p) => fetchTab(activeTab, p)}
                      />
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
