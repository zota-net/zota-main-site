'use client';

// TEMPORARY unauthenticated preview route — reproduces the dashboard overview's
// "Sales Trend" chart with mock data to diagnose a responsiveness issue.
// Not linked from anywhere. Delete before shipping.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';

const MOBILE_MONEY_COLOR = '#22c55e';
const DIRECT_VOUCHER_COLOR = '#f97316';

const salesChartConfig: ChartConfig = {
  mobileMoney: { label: 'Mobile Money', color: MOBILE_MONEY_COLOR },
  directVoucher: { label: 'Direct Voucher', color: DIRECT_VOUCHER_COLOR },
};

const salesByDate = [
  { date: 'Jun 05', mobileMoney: 120000, directVoucher: 45000 },
  { date: 'Jun 06', mobileMoney: 98000, directVoucher: 62000 },
  { date: 'Jun 07', mobileMoney: 154000, directVoucher: 38000 },
  { date: 'Jun 08', mobileMoney: 176000, directVoucher: 71000 },
  { date: 'Jun 09', mobileMoney: 132000, directVoucher: 55000 },
  { date: 'Jun 10', mobileMoney: 205000, directVoucher: 82000 },
  { date: 'Jun 11', mobileMoney: 189000, directVoucher: 64000 },
  { date: 'Jun 12', mobileMoney: 143000, directVoucher: 47000 },
  { date: 'Jun 13', mobileMoney: 167000, directVoucher: 59000 },
  { date: 'Jun 14', mobileMoney: 198000, directVoucher: 73000 },
];

export default function ChartPreviewPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-2">BEFORE (current code — nested ResponsiveContainer)</h2>
        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-2" id="before-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesByDate} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="mobileMoneyGradientA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={MOBILE_MONEY_COLOR} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={MOBILE_MONEY_COLOR} stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="directVoucherGradientA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={DIRECT_VOUCHER_COLOR} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={DIRECT_VOUCHER_COLOR} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `UGX ${value.toLocaleString()}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
                    <Area type="monotone" dataKey="directVoucher" stackId="sales" name="Direct Voucher" stroke={DIRECT_VOUCHER_COLOR} fill="url(#directVoucherGradientA)" strokeWidth={2} />
                    <Area type="monotone" dataKey="mobileMoney" stackId="sales" name="Mobile Money" stroke={MOBILE_MONEY_COLOR} fill="url(#mobileMoneyGradientA)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-2">AFTER (single ResponsiveContainer — via ChartContainer only)</h2>
        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-2" id="after-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                <AreaChart data={salesByDate} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="mobileMoneyGradientB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={MOBILE_MONEY_COLOR} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={MOBILE_MONEY_COLOR} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="directVoucherGradientB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DIRECT_VOUCHER_COLOR} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={DIRECT_VOUCHER_COLOR} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `UGX ${value.toLocaleString()}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
                  <Area type="monotone" dataKey="directVoucher" stackId="sales" name="Direct Voucher" stroke={DIRECT_VOUCHER_COLOR} fill="url(#directVoucherGradientB)" strokeWidth={2} />
                  <Area type="monotone" dataKey="mobileMoney" stackId="sales" name="Mobile Money" stroke={MOBILE_MONEY_COLOR} fill="url(#mobileMoneyGradientB)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
