'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/lib/store/user-store';
import { reportsService } from '@/lib/api/services/wallet';
import { clientsService } from '@/lib/api/services/base-operations';
import type { ClientReport, SalesReport, VoucherSale } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from '@/components/common';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

const chartConfig: ChartConfig = {
  amount: { label: 'Sales', color: 'hsl(var(--primary))' },
  count: { label: 'Transactions', color: 'hsl(var(--accent))' },
};

const providerColors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(220 70% 50%)', 'hsl(280 70% 50%)', 'hsl(var(--muted-foreground))'];

const rangeLabel = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
} as const;

export default function AnalyticsPage() {
  const { user } = useUserStore();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [clientReport, setClientReport] = useState<ClientReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientId = user?.client_id;
    if (!clientId) return;

    setLoading(true);
    Promise.all([
      reportsService.getSalesReport(clientId),
      clientsService.getReport(clientId),
    ])
      .then(([salesData, reportData]) => {
        setSalesReport(salesData);
        setClientReport(reportData);
      })
      .catch(() => {
        setSalesReport(null);
        setClientReport(null);
      })
      .finally(() => setLoading(false));
  }, [user?.client_id]);

  const sales = salesReport?.sales ?? [];

  const filteredSales = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    start.setDate(start.getDate() - days);

    return sales.filter((sale) => parseISO(sale.createdAt) >= start);
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

  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalNetRevenue = salesReport?.summary.netRevenue ?? 0;
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Live sales and client report data from backend services
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(rangeLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" disabled={loading}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Voucher Sales</p>
                    <p className="text-3xl font-bold mt-1">
                      <AnimatedCounter value={salesReport?.summary.totalSales ?? 0} suffix="" />
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    {rangeLabel[timeRange]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gross Revenue</p>
                    <p className="text-3xl font-bold mt-1">
                      UGX {totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    Live
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Revenue</p>
                    <p className="text-3xl font-bold mt-1">
                      UGX {totalNetRevenue.toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    Backend
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Sale</p>
                    <p className="text-3xl font-bold mt-1">
                      UGX {averageSale.toFixed(0).toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    {totalSales ? `${Math.round((averageSale / (totalRevenue || 1)) * 100)}%` : '0%'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Revenue and volume for selected range</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      fill="url(#salesGradient)"
                      strokeWidth={2}
                    />
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
                <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={providerDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {providerDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {providerDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Report Summary</CardTitle>
            <CardDescription>Backend client metrics from the report endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Active Vouchers</p>
                <p className="text-lg font-semibold">{clientReport?.activeVouchers ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Devices</p>
                <p className="text-lg font-semibold">{clientReport?.totalDevices ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Packages</p>
                <p className="text-lg font-semibold">{clientReport?.activePackages ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-semibold">UGX {clientReport?.totalRevenue?.toLocaleString() ?? '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
