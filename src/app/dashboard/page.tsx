'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Server,
  Wifi,
  Zap,
  Clock,
  HardDrive,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { StatsCard, NodesCard } from '@/components/dashboard/cards';
import { useNetworkStore } from '@/lib/store/network-store';
import { useUserStore } from '@/lib/store/user-store';
import { clientsService } from '@/lib/api/services/base-operations';
import { walletsService, reportsService } from '@/lib/api/services/wallet';
import type { ClientReport, SalesReport } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Bar, BarChart } from 'recharts';

const salesChartConfig: ChartConfig = {
  amount: { label: 'Sales', color: 'hsl(var(--primary))' },
  count: { label: 'Transactions', color: 'hsl(var(--accent))' },
};

export default function DashboardOverviewPage() {
  const { metrics, nodes } = useNetworkStore();
  const { user } = useUserStore();
  const [report, setReport] = useState<ClientReport | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);

  useEffect(() => {
    const clientId = user?.client_id;
    if (!clientId) return;
    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        // Load sales report (don't let getReport failure affect it)
        try {
          const salesData = await reportsService.getSalesReport(clientId);
          if (!cancelled) {
            setSalesReport(salesData);
            console.debug('Sales report loaded:', salesData);
          }
        } catch (salesErr) {
          console.error('Sales report load failed:', salesErr);
          if (!cancelled) {
            setSalesReport(null);
          }
        }

        // Load client report (independently)
        try {
          const clientReport = await clientsService.getReport(clientId);
          if (!cancelled) {
            setReport(clientReport);
            console.debug('Client report loaded:', clientReport);
          }
        } catch (reportErr) {
          console.error('Client report load failed:', reportErr);
          if (!cancelled) {
            setReport(null);
          }
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error);
      }

      try {
        const wallet = await walletsService.getByUser(user.id, 'Client');
        if (!cancelled) {
          setWalletBalance(wallet.balance ?? 0);
        }
      } catch (walletError) {
        console.warn('Wallet load failed', walletError);
        if (!cancelled) {
          setWalletBalance(0);
        }
      }
    };

    loadDashboardData();
    return () => { cancelled = true; };
  }, [user?.client_id, user?.id]);

  const recentVoucherSales = useMemo(() => {
    if (!salesReport?.sales) {
      console.debug('recentVoucherSales: no sales data', { salesReport });
      return [];
    }
    const sorted = [...salesReport.sales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    console.debug('recentVoucherSales computed:', { count: sorted.length, items: sorted });
    return sorted;
  }, [salesReport]);

  const salesByDate = useMemo(() => {
    if (!salesReport?.sales) {
      console.debug('salesByDate: no sales data', { salesReport });
      return [];
    }

    const map = new Map<string, { date: string; amount: number; count: number; iso: string }>();

    salesReport.sales.forEach((sale) => {
      const iso = format(parseISO(sale.createdAt), 'yyyy-MM-dd');
      const date = format(parseISO(sale.createdAt), 'MMM dd');
      const current = map.get(iso) ?? { date, amount: 0, count: 0, iso };
      current.amount += sale.amount;
      current.count += 1;
      map.set(iso, current);
    });

    const result = Array.from(map.values()).sort((a, b) => a.iso.localeCompare(b.iso));
    console.debug('salesByDate computed:', { count: result.length, items: result });
    return result;
  }, [salesReport]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatTransactionDate = (date: string) =>
    format(parseISO(date), 'MMM d, h:mm a');

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-1"
        >
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, {user?.name?.split(' ')[0] || 'Operator'}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your network today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatsCard
              title="Net Sales"
              value={salesReport?.summary.totalRevenue ?? salesReport?.summary.netRevenue ?? report?.totalRevenue ?? 0}
              description="Total revenue from sales"
              icon={Server}
              variant="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Voucher Sales"
              value={salesReport?.summary.totalSales ?? salesReport?.sales.length ?? report?.totalVouchers ?? 0}
              suffix=""
              decimals={0}
              description="Total vouchers sold"
              icon={Activity}
              variant="success"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Account Balance"
              value={walletBalance}
              prefix="UGX "
              decimals={0}
              description="Current account balance"
              icon={Clock}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Connected Devices"
              value={report?.totalDevices ?? 0}
              suffix=""
              decimals={0}
              description="Total Connected Devices"
              icon={Zap}
              variant="success"
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Charts and Info Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesByDate}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `UGX ${value.toLocaleString()}`}
                    />
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

          {/* Recent Voucher Sales */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Recent Voucher Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {recentVoucherSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <p className="text-sm">No recent voucher sales available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentVoucherSales.map((sale) => (
                    <div key={`${sale.id}-${sale.createdAt}`} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{sale.voucherCode || sale.id}</p>
                          <p className="text-xs text-muted-foreground truncate">{sale.provider || 'Voucher sale'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(sale.amount)}</p>
                          <p className="text-xs text-muted-foreground">{formatTransactionDate(sale.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatsCard
              title="Active Connections"
              value={metrics.activeConnections}
              description="Current sessions"
              icon={Wifi}
              prefix=""
              suffix=""
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Data Processed"
              value={metrics.dataProcessed}
              suffix=" TB"
              decimals={1}
              description="Last 24 hours"
              icon={HardDrive}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Packet Loss"
              value={metrics.packetLossRate}
              suffix="%"
              decimals={2}
              description="Current rate"
              icon={Activity}
              variant={metrics.packetLossRate > 0.1 ? 'warning' : 'default'}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Online Operators"
              value={12}
              description="Active users"
              icon={Users}
            />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
