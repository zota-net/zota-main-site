'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Search,
  Download,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  Eye,
  Ban,
  RotateCcw,
  FileText,
  Wallet as WalletIcon,
  Building,
  User,
  Phone,
  Send,
  Banknote,
  FileBarChart,
  Headphones,
  ArrowLeftRight,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Bar, BarChart } from 'recharts';
import { PageTransition, AnimatedCounter } from '@/components/common';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { walletsService, purchasesService, reportsService, withdrawalsService } from '@/lib/api/services/wallet';
import { useUserStore } from '@/lib/store/user-store';
import { ApiError } from '@/lib/api/client';
import type { Transaction as ApiTransaction, VoucherSale, SalesReport, Wallet } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';

// Payment types
interface Payment {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  method: 'card' | 'bank_transfer' | 'wallet' | 'crypto';
  type: 'subscription' | 'voucher' | 'topup' | 'service';
  description: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: Record<string, string>;
}

// Map API transaction to local Payment interface
const mapApiTransaction = (t: ApiTransaction): Payment => ({
  id: String(t.id),
  transactionId: String(t.reference ?? t.id),
  customerId: t.walletId,
  customerName: t.description || 'Unknown',
  customerEmail: '',
  customerPhone: '',
  amount: Math.abs(t.amount),
  currency: 'UGX',
  status: (t.status === 'completed' ? 'completed' : t.status === 'pending' ? 'pending' : t.status === 'failed' ? 'failed' : 'completed') as Payment['status'],
  method: 'wallet' as Payment['method'],
  type: (t.type === 'purchase' ? 'voucher' : t.type === 'topup' ? 'topup' : 'service') as Payment['type'],
  description: t.description || '',
  createdAt: new Date(t.createdAt),
  completedAt: t.status === 'completed' ? new Date(t.createdAt) : undefined,
});

const mapVoucherSale = (s: VoucherSale): Payment => ({
  id: String(s.id),
  transactionId: String(s.voucherCode),
  customerId: String(s.clientId),
  customerName: s.phone || 'Voucher Sale',
  customerEmail: '',
  customerPhone: s.phone || '',
  amount: s.amount,
  currency: 'UGX',
  status: 'completed',
  method: 'wallet',
  type: 'voucher',
  description: `Voucher ${s.voucherCode}`,
  createdAt: new Date(s.createdAt),
  completedAt: new Date(s.createdAt),
});

// Revenue chart data for different time ranges
const revenueDataSets = {
  '7d': [
    { date: 'Jan 30', revenue: 24500, transactions: 298 },
    { date: 'Jan 31', revenue: 22800, transactions: 275 },
    { date: 'Feb 1', revenue: 22100, transactions: 267 },
    { date: 'Feb 2', revenue: 25400, transactions: 301 },
    { date: 'Feb 3', revenue: 23900, transactions: 289 },
    { date: 'Feb 4', revenue: 27200, transactions: 324 },
    { date: 'Feb 5', revenue: 26800, transactions: 312 },
  ],
  '30d': [
    { date: 'Jan 7', revenue: 12400, transactions: 145 },
    { date: 'Jan 14', revenue: 15600, transactions: 189 },
    { date: 'Jan 21', revenue: 18900, transactions: 234 },
    { date: 'Jan 28', revenue: 21300, transactions: 256 },
    { date: 'Feb 4', revenue: 26800, transactions: 312 },
  ],
  '90d': [
    { date: 'Nov', revenue: 78500, transactions: 945 },
    { date: 'Dec', revenue: 92400, transactions: 1123 },
    { date: 'Jan', revenue: 105600, transactions: 1289 },
    { date: 'Feb', revenue: 52300, transactions: 642 },
  ],
  '1y': [
    { date: 'Mar', revenue: 68400, transactions: 823 },
    { date: 'Apr', revenue: 72100, transactions: 876 },
    { date: 'May', revenue: 81300, transactions: 989 },
    { date: 'Jun', revenue: 79800, transactions: 967 },
    { date: 'Jul', revenue: 85600, transactions: 1034 },
    { date: 'Aug', revenue: 89200, transactions: 1078 },
    { date: 'Sep', revenue: 92800, transactions: 1123 },
    { date: 'Oct', revenue: 86400, transactions: 1045 },
    { date: 'Nov', revenue: 78500, transactions: 945 },
    { date: 'Dec', revenue: 92400, transactions: 1123 },
    { date: 'Jan', revenue: 105600, transactions: 1289 },
    { date: 'Feb', revenue: 52300, transactions: 642 },
  ],
  'custom': [] as { date: string; revenue: number; transactions: number }[],
};

// Annual revenue calculation
const annualRevenue = revenueDataSets['1y'].reduce((sum, item) => sum + item.revenue, 0);

const statusConfig = {
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  failed: { label: 'Failed', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: RotateCcw },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: Ban },
};

const methodConfig = {
  card: { label: 'Card', icon: CreditCard, color: 'text-blue-500' },
  bank_transfer: { label: 'Bank Transfer', icon: Building, color: 'text-green-500' },
  wallet: { label: 'Wallet', icon: WalletIcon, color: 'text-purple-500' },
  crypto: { label: 'Crypto', icon: DollarSign, color: 'text-amber-500' },
};

const chartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
  transactions: { label: 'Transactions', color: 'hsl(var(--chart-2))' },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const user = useUserStore((s) => s.user);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!user?.client_id) return;
    try {
      setIsLoadingPayments(true);

      const [sales, report] = await Promise.all([
        purchasesService.getVoucherSales(user.client_id),
        reportsService.getSalesReport(user.client_id),
      ]);

      const mappedSales = sales
        .map(mapVoucherSale)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      let walletData: Wallet | null = null;
      let mappedTransactions: Payment[] = [];

      try {
        walletData = await walletsService.getByUser(user.id, 'Client');
        setWallet(walletData);

        // Load wallet transactions if wallet exists
        const walletTxns = await walletsService.getTransactions(walletData.id, 50);
        mappedTransactions = walletTxns
          .map(mapApiTransaction)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (walletErr) {
        console.warn('Wallet not found or no transactions available:', walletErr);
        setWallet(null);
      }

      setPayments([...mappedSales, ...mappedTransactions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setSalesReport(report);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      toast.error(err instanceof ApiError ? err.message : 'Failed to load payments');
    } finally {
      setIsLoadingPayments(false);
    }
  }, [user?.client_id, user?.id]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    phone: '',
    provider: 'MTN' as 'MTN' | 'Airtel'
  });

  // Get current revenue data based on time range - memoized to ensure proper reactivity
  const revenueData = useMemo(() => {
    if (!salesReport?.sales) return [];

    // Group sales by date and calculate daily totals
    const salesByDate = new Map<string, { date: string; revenue: number; transactions: number; iso: string }>();

    salesReport.sales.forEach((sale) => {
      const iso = format(parseISO(sale.createdAt), 'yyyy-MM-dd');
      const date = format(parseISO(sale.createdAt), 'MMM dd');
      const current = salesByDate.get(iso) ?? { date, revenue: 0, transactions: 0, iso };
      current.revenue += sale.amount;
      current.transactions += 1;
      salesByDate.set(iso, current);
    });

    // Convert to array and sort by date
    const data = Array.from(salesByDate.values()).sort((a, b) => a.iso.localeCompare(b.iso));

    // Apply time range filtering
    if (chartTimeRange === 'custom' && customDateRange.start && customDateRange.end) {
      const startDate = new Date(customDateRange.start + 'T00:00:00');
      const endDate = new Date(customDateRange.end + 'T00:00:00');
      
      return data.filter(item => {
        const itemDate = new Date(item.iso + 'T00:00:00');
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // For predefined ranges, slice the data accordingly
    const now = new Date();
    const daysToShow = chartTimeRange === '7d' ? 7 : chartTimeRange === '30d' ? 30 : chartTimeRange === '90d' ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - (daysToShow * 24 * 60 * 60 * 1000));

    return data.filter(item => new Date(item.iso + 'T00:00:00') >= cutoffDate);
  }, [salesReport, chartTimeRange, customDateRange.start, customDateRange.end]);

  // Calculate peak payment times (daily, monthly, annually)
  const peakPaymentTimes = useMemo(() => {
    // Daily peak hours (0-23)
    const hourlyData: Record<number, { count: number; amount: number }> = {};
    // Weekly peak days (0=Sunday, 6=Saturday)
    const dailyData: Record<number, { count: number; amount: number }> = {};
    // Monthly peak months (0=Jan, 11=Dec)
    const monthlyData: Record<number, { count: number; amount: number }> = {};

    // Initialize
    for (let i = 0; i < 24; i++) hourlyData[i] = { count: 0, amount: 0 };
    for (let i = 0; i < 7; i++) dailyData[i] = { count: 0, amount: 0 };
    for (let i = 0; i < 12; i++) monthlyData[i] = { count: 0, amount: 0 };

    // Aggregate data
    payments.forEach((payment) => {
      if (payment.status === 'completed') {
        const date = payment.createdAt;
        const hour = date.getHours();
        const day = date.getDay();
        const month = date.getMonth();

        hourlyData[hour].count += 1;
        hourlyData[hour].amount += payment.amount;
        dailyData[day].count += 1;
        dailyData[day].amount += payment.amount;
        monthlyData[month].count += 1;
        monthlyData[month].amount += payment.amount;
      }
    });

    // Find peaks
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const peakHour = Object.entries(hourlyData).reduce((max, [hour, data]) => 
      data.count > max.count ? { hour: parseInt(hour), ...data } : max
    , { hour: 0, count: 0, amount: 0 });

    const peakDay = Object.entries(dailyData).reduce((max, [day, data]) => 
      data.count > max.count ? { day: parseInt(day), ...data } : max
    , { day: 0, count: 0, amount: 0 });

    const peakMonth = Object.entries(monthlyData).reduce((max, [month, data]) => 
      data.count > max.count ? { month: parseInt(month), ...data } : max
    , { month: 0, count: 0, amount: 0 });

    // Format peak hour display (e.g., "2:00 PM - 3:00 PM")
    const formatHour = (hour: number) => {
      const startHour = hour % 12 || 12;
      const endHour = (hour + 1) % 12 || 12;
      const startPeriod = hour < 12 ? 'AM' : 'PM';
      const endPeriod = (hour + 1) < 12 || (hour + 1) === 24 ? 'AM' : 'PM';
      return `${startHour}:00 ${startPeriod} - ${endHour}:00 ${endPeriod}`;
    };

    // Create hourly chart data for visualization
    const hourlyChartData = Object.entries(hourlyData).map(([hour, data]) => ({
      hour: `${parseInt(hour) % 12 || 12}${parseInt(hour) < 12 ? 'a' : 'p'}`,
      hourNum: parseInt(hour),
      count: data.count,
      amount: data.amount,
      isPeak: parseInt(hour) === peakHour.hour,
    }));

    return {
      daily: {
        time: formatHour(peakHour.hour),
        transactions: peakHour.count,
        amount: peakHour.amount,
      },
      weekly: {
        day: dayNames[peakDay.day],
        transactions: peakDay.count,
        amount: peakDay.amount,
      },
      monthly: {
        month: monthNames[peakMonth.month],
        transactions: peakMonth.count,
        amount: peakMonth.amount,
      },
      hourlyChart: hourlyChartData,
    };
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const transactionId = String(p.transactionId || '');
      const customerName = String(p.customerName || '');
      const customerEmail = String(p.customerEmail || '');
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = transactionId.toLowerCase().includes(searchLower) ||
        customerName.toLowerCase().includes(searchLower) ||
        customerEmail.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      return matchesSearch && matchesStatus && matchesMethod && matchesType;
    });
  }, [payments, searchQuery, statusFilter, methodFilter, typeFilter]);

  // Stats
  const stats = useMemo(() => {
    const completed = payments.filter((p) => p.status === 'completed');
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);

    return {
      accountBalance: wallet?.balance ?? 0,
      netSales: salesReport?.summary.netRevenue ?? totalRevenue,
    };
  }, [payments, salesReport, wallet?.balance]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const handleRefund = (id: string) => {
    setPayments(payments.map((p) => 
      p.id === id ? { ...p, status: 'refunded' as const } : p
    ));
    toast.success('Payment refunded successfully');
  };

  const handleRetry = (id: string) => {
    setPayments(payments.map((p) => 
      p.id === id ? { ...p, status: 'pending' as const } : p
    ));
    toast.success('Payment retry initiated');
  };

  const formatCurrency = (amount: number, currency: string = 'UGX', compact: boolean = true) => {
    if (compact && amount >= 1000) {
      return new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount);
    }
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Payments
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monitor transactions and manage payment operations
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="h-8 sm:h-9"
              onClick={() => setTransferDialogOpen(true)}
            >
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Transfer Funds</span>
            </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 sm:h-9"
                onClick={() => setWithdrawDialogOpen(true)}
                disabled={!wallet}
              >
                <Banknote className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Withdraw</span>
              </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 sm:h-9"
              onClick={() => setReportDialogOpen(true)}
            >
              <FileBarChart className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Request Report</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 sm:h-9"
              onClick={() => {
                toast.success('Connecting to support agent...');
                window.location.href = '/dashboard/support';
              }}
            >
              <Headphones className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Talk to Agent</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 sm:h-9">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-3 sm:pt-6 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Account Balance</p>
                  <div className="flex items-center text-green-500">
                    <WalletIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                    <span className="text-[10px] sm:text-xs">Live</span>
                  </div>
                </div>
                <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 text-green-500">
                  {formatCurrency(stats.accountBalance)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card>
              <CardContent className="p-3 sm:pt-6 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Net Sales</p>
                  <div className="flex items-center text-primary">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                </div>
                <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 text-primary">
                  {formatCurrency(stats.netSales)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Revenue for the selected period</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-lg border bg-muted/50 p-1">
                    {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                      <Button
                        key={range}
                        variant={chartTimeRange === range ? 'default' : 'ghost'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setChartTimeRange(range)}
                      >
                        {range === '7d' ? '7D' : range === '30d' ? '30D' : range === '90d' ? '90D' : '1Y'}
                      </Button>
                    ))}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={chartTimeRange === 'custom' ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Custom
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-3">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Start Date</Label>
                          <Input
                            type="date"
                            value={customDateRange.start}
                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">End Date</Label>
                          <Input
                            type="date"
                            value={customDateRange.end}
                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        </div>
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => {
                            if (customDateRange.start && customDateRange.end) {
                              setChartTimeRange('custom');
                              toast.success(`Showing data from ${customDateRange.start} to ${customDateRange.end}`);
                            } else {
                              toast.error('Please select both start and end dates');
                            }
                          }}
                        >
                          Apply Custom Range
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `Ush ${v / 1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>View and manage payment transactions</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="voucher">Voucher</SelectItem>
                    <SelectItem value="topup">Top-up</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredPayments.slice(0, 15).map((payment) => {
                      const statusInfo = statusConfig[payment.status];
                      const methodInfo = methodConfig[payment.method];
                      const StatusIcon = statusInfo.icon;
                      const MethodIcon = methodInfo.icon;
                      
                      return (
                        <motion.tr
                          key={`${payment.type}-${payment.id}-${payment.createdAt.getTime()}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group"
                        >
                          <TableCell>
                            <div>
                              <p className="font-mono text-sm">{payment.transactionId}</p>
                              <p className="text-xs text-muted-foreground">{payment.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{payment.customerName}</p>
                                <p className="text-xs text-muted-foreground truncate">{payment.customerEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{payment.customerPhone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              'font-semibold',
                              payment.status === 'refunded' ? 'text-purple-500' : 
                              payment.status === 'completed' ? 'text-green-500' : ''
                            )}>
                              {payment.status === 'refunded' && '-'}
                              {formatCurrency(payment.amount, payment.currency, false)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <MethodIcon className={cn('h-4 w-4', methodInfo.color)} />
                              <span className="text-sm">{methodInfo.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {formatDate(payment.createdAt)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Download Receipt
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {payment.status === 'failed' && (
                                  <DropdownMenuItem onClick={() => handleRetry(payment.id)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry Payment
                                  </DropdownMenuItem>
                                )}
                                {payment.status === 'completed' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleRefund(payment.id)}>
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Refund
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        toast.info(`Initiating reversal for ${payment.transactionId}...`);
                                        setTimeout(() => {
                                          setPayments(prev => prev.map(p => 
                                            p.id === payment.id ? { ...p, status: 'refunded' as const } : p
                                          ));
                                          toast.success('Transaction reversed successfully');
                                        }, 1500);
                                      }}
                                      className="text-amber-600"
                                    >
                                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                                      Reverse Transaction
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            
            {filteredPayments.length > 15 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing 15 of {filteredPayments.length} transactions
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Payment Times */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Peak Payment Times
                </CardTitle>
                <CardDescription>When customers make the most transactions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Daily Peak */}
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Peak</p>
                    <p className="text-lg font-bold mt-1 text-blue-500">{peakPaymentTimes.daily.time}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Transactions: </span>
                    <span className="font-semibold">{peakPaymentTimes.daily.transactions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revenue: </span>
                    <span className="font-semibold text-green-500">{formatCurrency(peakPaymentTimes.daily.amount)}</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-blue-500/10" />
              </div>

              {/* Weekly Peak */}
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weekly Peak</p>
                    <p className="text-lg font-bold mt-1 text-purple-500">{peakPaymentTimes.weekly.day}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Transactions: </span>
                    <span className="font-semibold">{peakPaymentTimes.weekly.transactions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revenue: </span>
                    <span className="font-semibold text-green-500">{formatCurrency(peakPaymentTimes.weekly.amount)}</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-purple-500/10" />
              </div>

              {/* Monthly Peak */}
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly Peak</p>
                    <p className="text-lg font-bold mt-1 text-amber-500">{peakPaymentTimes.monthly.month}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Transactions: </span>
                    <span className="font-semibold">{peakPaymentTimes.monthly.transactions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revenue: </span>
                    <span className="font-semibold text-green-500">{formatCurrency(peakPaymentTimes.monthly.amount)}</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-amber-500/10" />
              </div>
            </div>

            {/* Hourly Activity Chart */}
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">24-Hour Transaction Distribution</p>
              <div className="flex items-end gap-0.5 h-24">
                {peakPaymentTimes.hourlyChart.map((item) => {
                  const maxCount = Math.max(...peakPaymentTimes.hourlyChart.map(h => h.count), 1);
                  const heightPercent = (item.count / maxCount) * 100;
                  const minHeight = item.count > 0 ? 8 : 4; // Minimum visible height
                  
                  // Calculate activity level for green gradient
                  const activityLevel = item.count / maxCount;
                  const getBarColor = () => {
                    if (item.isPeak) return "bg-primary"; // Peak hour stays orange
                    if (item.count === 0) return "bg-green-950/20";
                    if (activityLevel >= 0.8) return "bg-green-600 group-hover:bg-green-500";
                    if (activityLevel >= 0.6) return "bg-green-500 group-hover:bg-green-400";
                    if (activityLevel >= 0.4) return "bg-green-400/70 group-hover:bg-green-400";
                    if (activityLevel >= 0.2) return "bg-green-300/50 group-hover:bg-green-300/70";
                    return "bg-green-200/30 group-hover:bg-green-200/50";
                  };
                  
                  return (
                    <div key={item.hourNum} className="flex-1 flex flex-col items-center group relative h-full">
                      <div className="flex-1" /> {/* Spacer to push bar to bottom */}
                      <div
                        className={cn(
                          "w-full rounded-t transition-all duration-300 min-h-[4px]",
                          getBarColor()
                        )}
                        style={{ height: `${Math.max(heightPercent, minHeight)}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-popover border rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[100px] whitespace-nowrap">
                        <p className="text-xs font-medium">{item.hourNum}:00 - {(item.hourNum + 1) % 24}:00</p>
                        <p className="text-xs text-muted-foreground">{item.count} transactions</p>
                        <p className="text-xs text-green-500">{formatCurrency(item.amount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Hour labels */}
              <div className="flex justify-between mt-2 px-0">
                <span className="text-[10px] text-muted-foreground">12a</span>
                <span className="text-[10px] text-muted-foreground">6a</span>
                <span className="text-[10px] text-muted-foreground">12p</span>
                <span className="text-[10px] text-muted-foreground">6p</span>
                <span className="text-[10px] text-muted-foreground">11p</span>
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded bg-primary" />
                  <span className="text-muted-foreground">Peak Hour</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-6 rounded bg-gradient-to-r from-green-200/30 via-green-400 to-green-600" />
                  <span className="text-muted-foreground">Activity (Low → High)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                {selectedPayment?.transactionId}
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="text-2xl font-bold text-green-500">
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency, false)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge variant="outline" className={cn('mt-1', statusConfig[selectedPayment.status].color)}>
                      {statusConfig[selectedPayment.status].label}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-muted-foreground">Customer</Label>
                    <p className="font-medium">{selectedPayment.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedPayment.customerEmail}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedPayment.customerPhone}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-muted-foreground">Payment Method</Label>
                    <p className="font-medium">{methodConfig[selectedPayment.method].label}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="font-medium capitalize">{selectedPayment.type}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium">{selectedPayment.description}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="font-medium">{selectedPayment.createdAt.toLocaleString()}</p>
                  </div>
                </div>

                {selectedPayment.completedAt && (
                  <div className="pt-4 border-t">
                    <Label className="text-muted-foreground">Completed</Label>
                    <p className="font-medium">{selectedPayment.completedAt.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                Close
              </Button>
              <Button>
                <Receipt className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer Funds Dialog */}
        <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Transfer Funds
              </DialogTitle>
              <DialogDescription>
                Send money to another account or customer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Recipient Account</Label>
                <Input placeholder="Enter account number or email" />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="0.00" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input placeholder="What's this transfer for?" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Transfer initiated successfully!');
                setTransferDialogOpen(false);
              }}>
                <Send className="h-4 w-4 mr-2" />
                Send Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Withdraw Funds
              </DialogTitle>
              <DialogDescription>
                Withdraw money to your mobile money account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!wallet ? (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-500">Wallet Not Found</p>
                      <p className="text-muted-foreground mt-1">
                        You need to set up a wallet before you can withdraw funds. Please contact support to create your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(wallet.balance || 0, 'UGX', false)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Withdrawal Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-9"
                        value={withdrawalForm.amount}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Money Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="tel" 
                        placeholder="+256 XXX XXX XXX" 
                        className="pl-9"
                        value={withdrawalForm.phone}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Money Provider</Label>
                    <Select 
                      value={withdrawalForm.provider} 
                      onValueChange={(value: 'MTN' | 'Airtel') => setWithdrawalForm(prev => ({ ...prev, provider: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                        <SelectItem value="Airtel">Airtel Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Withdrawal Fees Notice */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-500">Withdrawal Fees Apply</p>
                        <ul className="text-muted-foreground mt-1 space-y-0.5 text-xs">
                          <li>• Standard withdrawal: <span className="text-foreground font-medium">UGX 2,500</span> per transaction</li>
                          <li>• Express withdrawal (same day): <span className="text-foreground font-medium">UGX 5,000</span> per transaction</li>
                          <li>• Minimum withdrawal amount: <span className="text-foreground font-medium">UGX 10,000</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                {wallet ? 'Cancel' : 'Close'}
              </Button>
              {wallet && (
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 font-semibold"
                  onClick={async () => {
                    const amount = parseFloat(withdrawalForm.amount);
                    if (!amount || amount < 10000) {
                      toast.error('Minimum withdrawal amount is UGX 10,000');
                      return;
                    }
                    
                    if (!withdrawalForm.phone) {
                      toast.error('Please enter a mobile money number');
                      return;
                    }
                    
                    try {
                      await withdrawalsService.initiate({
                        walletId: wallet.id,
                        amount,
                        phone: withdrawalForm.phone,
                        provider: withdrawalForm.provider
                      });
                      
                      toast.success('Withdrawal request submitted successfully!');
                      setWithdrawDialogOpen(false);
                      setWithdrawalForm({ amount: '', phone: '', provider: 'MTN' });
                      
                      // Refresh wallet balance
                      const updatedWallet = await walletsService.getByUser(user!.id, 'Client');
                      setWallet(updatedWallet);
                    } catch (err) {
                      console.error('Withdrawal failed:', err);
                      toast.error(err instanceof ApiError ? err.message : 'Withdrawal failed');
                    }
                  }}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Withdraw Funds
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request Report Dialog */}
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                Request Transaction Report
              </DialogTitle>
              <DialogDescription>
                Generate a detailed report of your transactions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="completed">Completed Only</SelectItem>
                    <SelectItem value="pending">Pending Only</SelectItem>
                    <SelectItem value="failed">Failed/Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    <SelectItem value="xlsx">Excel Workbook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email Report To</Label>
                <Input type="email" placeholder="your@email.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Report generation started! You will receive it via email.');
                setReportDialogOpen(false);
              }}>
                <FileBarChart className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
