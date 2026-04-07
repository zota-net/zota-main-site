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
import { StatsCard, AlertsCard, NodesCard } from '@/components/dashboard/cards';
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

    Promise.all([
      clientsService.getReport(clientId),
      walletsService.getByUser(user.id, 'Client'),
      reportsService.getSalesReport(clientId),
    ])
      .then(([clientReport, wallet, salesData]) => {
        setReport(clientReport);
        setWalletBalance(wallet.balance ?? 0);
        setSalesReport(salesData);
      })
      .catch(() => {});
  }, [user?.client_id, user?.id]);

  const salesByDate = useMemo(() => {
    if (!salesReport?.sales) return [];

    const map = new Map<string, { date: string; amount: number; count: number; iso: string }>();

    salesReport.sales.forEach((sale) => {
      const iso = format(parseISO(sale.createdAt), 'yyyy-MM-dd');
      const date = format(parseISO(sale.createdAt), 'MMM dd');
      const current = map.get(iso) ?? { date, amount: 0, count: 0, iso };
      current.amount += sale.amount;
      current.count += 1;
      map.set(iso, current);
    });

    return Array.from(map.values()).sort((a, b) => a.iso.localeCompare(b.iso));
  }, [salesReport]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
              value={report?.totalRevenue ?? 0}
              description={`Total Revenue`}
              icon={Server}
              variant="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Voucher Sales"
              value={report?.totalVouchers ?? 0}
              suffix=""
              decimals={0}
              description="Total Vouchers Created"
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
              description="Current Account Balance"
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

          {/* Alerts */}
          <AlertsCard className="lg:col-span-1" maxItems={5} />
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
