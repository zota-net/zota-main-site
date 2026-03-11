'use client';

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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Bar, BarChart } from 'recharts';

// Generate mock chart data
const generateTrafficData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      inbound: Math.random() * 500 + 300,
      outbound: Math.random() * 400 + 200,
    });
  }
  return data;
};

const generateLatencyData = () => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push({
      minute: i,
      latency: Math.random() * 20 + 10,
    });
  }
  return data;
};

const trafficData = generateTrafficData();
const latencyData = generateLatencyData();

const trafficChartConfig: ChartConfig = {
  inbound: {
    label: 'Inbound',
    color: 'hsl(var(--primary))',
  },
  outbound: {
    label: 'Outbound',
    color: 'hsl(var(--accent))',
  },
};

export default function DashboardOverviewPage() {
  const { metrics, nodes } = useNetworkStore();
  const { user } = useUserStore();

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
              value={metrics.activeNodes}
              description={`Total Sales Today`}
              icon={Server}
              // trend={{ value: 2.5, label: 'vs yesterday', isPositive: true }}
              variant="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Voucher Sales"
              value={metrics.totalTraffic}
              suffix=" Gbps"
              decimals={1}
              description="Voucher Sales Today"
              icon={Activity}
              // trend={{ value: 12.3, label: 'vs yesterday', isPositive: true }}
              variant="success"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Account Balance"
              value={metrics.averageLatency}
              suffix=" ms"
              decimals={1}
              description="Current Account Balance"
              icon={Clock}
              // trend={{ value: -3.2, label: 'improved', isPositive: true }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Connected Devices"
              value={metrics.uptime}
              suffix="%"
              decimals={4}
              description="Actively Connected Devices"
              icon={Zap}
              variant="success"
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Charts and Info Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Traffic Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trafficChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="hour" 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      interval={3}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}G`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="inbound"
                      stroke="hsl(var(--primary))"
                      fill="url(#inboundGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="outbound"
                      stroke="hsl(var(--accent))"
                      fill="url(#outboundGradient)"
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
