'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Ticket,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Copy,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTransition, AnimatedCounter } from '@/components/common';
import { accountsService, purchasesService } from '@/lib/api/services/wallet';
import { useUserStore } from '@/lib/store/user-store';
import type { AgentAccount, VoucherSale } from '@/lib/api/types';
import { cn } from '@/lib/utils';

// Activity types
type ActivityType = 'voucher_created' | 'voucher_used' | 'commission_earned' | 'target_update' | 'status_change';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  amount?: number;
  icon: React.ReactNode;
  color: string;
}

interface DailyStats {
  vouchersCreated: number;
  vouchersUsed: number;
  commissionsEarned: number;
  activeListings: number;
  targetProgress: number;
  targetGoal: number;
}

type VoucherCategory = 'hotspot' | 'pppoe' | 'prepaid' | 'corporate' | 'guest';
type VoucherType = 'time' | 'data' | 'unlimited';
type VoucherStatus = 'active' | 'used' | 'expired' | 'revoked';

interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  category: VoucherCategory;
  value: string;
  duration: string;
  price: number;
  status: VoucherStatus;
  createdAt: Date;
  usedAt?: Date;
  usedBy?: string;
  commission: number;
}

const activityTypeConfig = {
  voucher_created: { label: 'Voucher Created', icon: Ticket, color: 'bg-blue-500' },
  voucher_used: { label: 'Voucher Used', icon: CheckCircle, color: 'bg-purple-500' },
  commission_earned: { label: 'Commission Earned', icon: DollarSign, color: 'bg-green-500' },
  target_update: { label: 'Target Update', icon: Target, color: 'bg-orange-500' },
  status_change: { label: 'Status Change', icon: AlertCircle, color: 'bg-red-500' },
};

const voucherCategoryConfig: Record<VoucherCategory, { label: string; color: string }> = {
  hotspot: { label: 'Hotspot', color: 'bg-orange-500/10 text-orange-500' },
  pppoe: { label: 'PPPoE', color: 'bg-blue-500/10 text-blue-500' },
  prepaid: { label: 'Prepaid', color: 'bg-green-500/10 text-green-500' },
  corporate: { label: 'Corporate', color: 'bg-purple-500/10 text-purple-500' },
  guest: { label: 'Guest', color: 'bg-gray-500/10 text-gray-500' },
};

const voucherTypeConfig: Record<VoucherType, { label: string; color: string }> = {
  time: { label: 'Time-based', color: 'bg-purple-500/10 text-purple-500' },
  data: { label: 'Data-based', color: 'bg-cyan-500/10 text-cyan-500' },
  unlimited: { label: 'Unlimited', color: 'bg-amber-500/10 text-amber-500' },
};

const voucherStatusConfig: Record<VoucherStatus, { label: string; color: string; icon: React.ComponentType<any> }> = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-500', icon: CheckCircle },
  used: { label: 'Used', color: 'bg-blue-500/10 text-blue-500', icon: CheckCircle },
  expired: { label: 'Expired', color: 'bg-yellow-500/10 text-yellow-500', icon: AlertCircle },
  revoked: { label: 'Revoked', color: 'bg-red-500/10 text-red-500', icon: AlertCircle },
};

export default function AgentDashboardPage() {
  const { user } = useUserStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [voucherStatusFilter, setVoucherStatusFilter] = useState<string>('all');
  const [agentAccounts, setAgentAccounts] = useState<AgentAccount[]>([]);
  const [voucherSales, setVoucherSales] = useState<VoucherSale[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const clientId = user?.client_id;
    if (!clientId) return;

    Promise.all([
      accountsService.getAgentsByClient(clientId),
      purchasesService.getVoucherSales(clientId),
    ])
      .then(([agents, sales]) => {
        setAgentAccounts(agents ?? []);
        setVoucherSales(sales ?? []);

        const mappedActivities: Activity[] = (sales ?? []).slice(0, 12).map((sale) => ({
          id: sale.id,
          type: 'voucher_created',
          title: 'Voucher Sale Recorded',
          description: `Sale of ${sale.voucherCode} for UGX ${sale.amount.toLocaleString()}`,
          timestamp: new Date(sale.createdAt),
          amount: sale.netAmount,
          icon: <Ticket className="h-4 w-4" />,
          color: 'bg-blue-500/10 text-blue-500',
        }));

        setActivities(mappedActivities);
      })
      .catch(() => {
        setAgentAccounts([]);
        setVoucherSales([]);
        setActivities([]);
      });
  }, [user?.client_id]);

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities;
    return activities.filter((a) => a.type === filterType);
  }, [filterType, activities]);

  const filteredVouchers = useMemo(() => {
    const mapped = voucherSales.map((sale) => ({
      id: sale.id,
      code: sale.voucherCode,
      type: 'time' as const,
      category: 'hotspot' as const,
      value: `UGX ${sale.amount.toLocaleString()}`,
      duration: 'N/A',
      price: sale.amount,
      status: 'active' as const,
      createdAt: new Date(sale.createdAt),
      usedAt: undefined,
      usedBy: sale.phone,
      commission: sale.fee,
    }));
    if (voucherStatusFilter === 'all') return mapped;
    return mapped.filter((v) => v.status === voucherStatusFilter);
  }, [voucherSales, voucherStatusFilter]);

  const targetPercentage = Math.min(100, Math.round((voucherSales.length / 50) * 100));
  const remainingTarget = 50 - voucherSales.length;
  const primaryAgent = agentAccounts[0];
  const totalEarnings = voucherSales.reduce((sum, sale) => sum + sale.netAmount, 0);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return date.toLocaleDateString();
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Agent Team
            </h1>
            <p className="text-muted-foreground mt-1">Live agent activity from backend sales and accounts</p>
          </div>
          <Badge className="h-fit capitalize">
            {agentAccounts.length > 0 ? `${agentAccounts.length} agents` : 'No agents'}
          </Badge>
        </div>

        {/* Agent Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 bg-primary text-primary-foreground text-xl">
                  <AvatarFallback>
                    {primaryAgent ? primaryAgent.agentFullname.split(' ').map((n) => n[0]).join('') : 'AG'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {primaryAgent ? primaryAgent.agentFullname : 'Agent Team Overview'}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {primaryAgent ? primaryAgent.agentEmail : 'No agent account selected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {agentAccounts.length > 0 ? `${agentAccounts.length} active agents` : 'No active agents found'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Sales Revenue</p>
                <p className="text-2xl font-bold text-green-500">UGX {totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: 'Agents',
              value: agentAccounts.length,
              icon: Users,
              color: 'text-blue-500',
            },
            {
              label: 'Voucher Sales',
              value: voucherSales.length,
              icon: Ticket,
              color: 'text-purple-500',
            },
            {
              label: 'Revenue',
              value: `UGX ${totalEarnings.toLocaleString()}`,
              icon: DollarSign,
              color: 'text-green-500',
            },
            {
              label: 'Active Listings',
              value: agentAccounts.length > 0 ? agentAccounts.length * 5 : 0,
              icon: TrendingUp,
              color: 'text-orange-500',
            },
            {
              label: 'Target Progress',
              value: `${targetPercentage}%`,
              icon: Target,
              color: 'text-cyan-500',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                  <p className={cn('text-2xl font-bold', stat.color)}>
                    {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        
        {/* Activity Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Activities
                </CardTitle>
                <CardDescription>Recent actions and transactions</CardDescription>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="voucher_created">Vouchers Created</SelectItem>
                  <SelectItem value="commission_earned">Commissions</SelectItem>
                  <SelectItem value="voucher_used">Vouchers Used</SelectItem>
                  <SelectItem value="target_update">Target Updates</SelectItem>
                  <SelectItem value="status_change">Status Changes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center">
                      <div className={cn('p-2 rounded-full', activity.color)}>
                        {activity.icon}
                      </div>
                      {index < filteredActivities.length - 1 && (
                        <div className="w-0.5 h-12 bg-muted mt-2" />
                      )}
                    </div>

                    {/* Activity content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        {activity.amount && (
                          <div className="text-right">
                            <p className="font-semibold text-green-500">
                              {activity.type === 'commission_earned' ? '+$' : '+'}
                              {activity.type === 'commission_earned'
                                ? activity.amount.toFixed(2)
                                : activity.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                          </div>
                        )}
                      </div>
                      {!activity.amount && (
                        <p className="text-xs text-muted-foreground mt-1">{formatTime(activity.timestamp)}</p>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No activities found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vouchers Sold Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Vouchers Sold Today
                </CardTitle>
                <CardDescription>Individual voucher details and status</CardDescription>
              </div>
              <Select value={voucherStatusFilter} onValueChange={setVoucherStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vouchers</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher, index) => {
                  const StatusIcon = voucherStatusConfig[voucher.status].icon;
                  
                  return (
                    <motion.div
                      key={voucher.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* Code and Status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded font-medium">
                              {voucher.code}
                            </code>
                            <Badge variant="outline" className={voucherStatusConfig[voucher.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {voucherStatusConfig[voucher.status].label}
                            </Badge>
                            <Badge variant="outline" className={voucherTypeConfig[voucher.type].color}>
                              {voucherTypeConfig[voucher.type].label}
                            </Badge>
                            <Badge variant="outline" className={voucherCategoryConfig[voucher.category].color}>
                              {voucherCategoryConfig[voucher.category].label}
                            </Badge>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Value</p>
                              <p className="font-medium">{voucher.value}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Duration</p>
                              <p className="font-medium">{voucher.duration}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Created</p>
                              <p className="font-medium text-xs">
                                {new Date(voucher.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                            {voucher.usedAt && (
                              <div>
                                <p className="text-muted-foreground text-xs">Used By</p>
                                <p className="font-medium text-xs">{voucher.usedBy}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price and Commission */}
                        <div className="text-right space-y-1">
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="text-lg font-bold">Ush {voucher.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Commission</p>
                            <p className="text-sm font-semibold text-green-500">
                              +Ush {voucher.commission.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Ticket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No vouchers found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        
      </div>
    </PageTransition>
  );
}
