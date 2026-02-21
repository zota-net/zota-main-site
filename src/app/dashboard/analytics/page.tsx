'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

// Generate mock analytics data
const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month) => ({
    month,
    traffic: Math.random() * 1000 + 500,
    latency: Math.random() * 30 + 10,
    errors: Math.floor(Math.random() * 100),
    uptime: 99 + Math.random(),
  }));
};

const generateHourlyData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      requests: Math.floor(Math.random() * 10000 + 5000),
      errors: Math.floor(Math.random() * 50),
    });
  }
  return data;
};

const pieData = [
  { name: 'Routers', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Servers', value: 25, color: 'hsl(var(--accent))' },
  { name: 'Switches', value: 20, color: 'hsl(220 70% 50%)' },
  { name: 'Endpoints', value: 15, color: 'hsl(280 70% 50%)' },
  { name: 'Other', value: 5, color: 'hsl(var(--muted-foreground))' },
];

const monthlyData = generateMonthlyData();
const hourlyData = generateHourlyData();

const chartConfig: ChartConfig = {
  traffic: { label: 'Traffic', color: 'hsl(var(--primary))' },
  latency: { label: 'Latency', color: 'hsl(var(--accent))' },
  requests: { label: 'Requests', color: 'hsl(var(--primary))' },
  errors: { label: 'Errors', color: 'hsl(var(--destructive))' },
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Network performance insights and trends
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-3xl font-bold mt-1">
                      <AnimatedCounter value={2847392} suffix="" />
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    12.5%
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
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-3xl font-bold mt-1">
                      <AnimatedCounter value={23.4} decimals={1} suffix="ms" />
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    8.2%
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
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                    <p className="text-3xl font-bold mt-1">
                      <AnimatedCounter value={0.12} decimals={2} suffix="%" />
                    </p>
                  </div>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    2.1%
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
                    <p className="text-sm text-muted-foreground">Throughput</p>
                    <p className="text-3xl font-bold mt-1">
                      <AnimatedCounter value={847} suffix=" Gbps" />
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    5.3%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Traffic Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Monthly network traffic and latency trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="traffic"
                      stroke="hsl(var(--primary))"
                      fill="url(#trafficGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Hourly Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Requests</CardTitle>
              <CardDescription>Request volume over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} interval={3} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Node Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Node Distribution</CardTitle>
              <CardDescription>Network nodes by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Error Analysis</CardTitle>
            <CardDescription>Error distribution and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <XAxis dataKey="hour" tickLine={false} axisLine={false} interval={3} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
