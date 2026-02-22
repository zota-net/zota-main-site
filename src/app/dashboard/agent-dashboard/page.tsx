'use client';

import { useState, useMemo } from 'react';
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

// Mock agent data
const mockAgent = {
  id: 'agent-1',
  name: 'James Smith',
  email: 'james.smith@example.com',
  phone: '+1-555-0123',
  tier: 'gold',
  region: 'West Region',
  avatar: undefined,
  totalEarnings: 12500,
  monthlyTarget: 5000,
  monthlyAchieved: 4200,
};

// Generate mock daily activities
const generateDailyActivities = (): Activity[] => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'voucher_created',
      title: 'Voucher Batch Created',
      description: 'Created 50 Hotspot vouchers (7-day packages)',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      amount: 50,
      icon: <Ticket className="h-4 w-4" />,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      id: '2',
      type: 'commission_earned',
      title: 'Commission Earned',
      description: 'Commission from 15 voucher sales',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      amount: 180,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'bg-green-500/10 text-green-500',
    },
    {
      id: '3',
      type: 'voucher_used',
      title: 'Vouchers Redeemed',
      description: '8 vouchers were redeemed by customers',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      amount: 8,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      id: '4',
      type: 'target_update',
      title: 'Target Progress Update',
      description: 'Monthly target 82% complete',
      timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
      amount: 4100,
      icon: <Target className="h-4 w-4" />,
      color: 'bg-orange-500/10 text-orange-500',
    },
    {
      id: '5',
      type: 'voucher_created',
      title: 'Voucher Batch Created',
      description: 'Created 30 PPPoE vouchers (30-day packages)',
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
      amount: 30,
      icon: <Ticket className="h-4 w-4" />,
      color: 'bg-blue-500/10 text-blue-500',
    },
  ];
  return activities;
};

const activityTypeConfig = {
  voucher_created: { label: 'Voucher Created', icon: Ticket, color: 'bg-blue-500' },
  voucher_used: { label: 'Voucher Used', icon: CheckCircle, color: 'bg-purple-500' },
  commission_earned: { label: 'Commission Earned', icon: DollarSign, color: 'bg-green-500' },
  target_update: { label: 'Target Update', icon: Target, color: 'bg-orange-500' },
  status_change: { label: 'Status Change', icon: AlertCircle, color: 'bg-red-500' },
};

// Voucher configurations
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

// Generate mock vouchers sold by agent
const generateAgentVouchers = (): Voucher[] => {
  const codes = ['VOC', 'VUC', 'VPC', 'VHC', 'VEC'];
  const categories: VoucherCategory[] = ['hotspot', 'pppoe', 'prepaid', 'corporate', 'guest'];
  const types: VoucherType[] = ['time', 'data', 'unlimited'];
  const statuses: VoucherStatus[] = ['active', 'used', 'expired', 'active', 'active', 'used'];

  return Array.from({ length: 15 }, (_, i) => {
    const code = `${codes[Math.floor(Math.random() * codes.length)]}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const type = types[Math.floor(Math.random() * types.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const price = 10 + Math.random() * 90;
    const commission = price * 0.1; // 10% commission

    return {
      id: `voucher-${i}`,
      code,
      type,
      category,
      value: type === 'time' ? `${7 + i % 3 * 10}d` : type === 'data' ? `${5 + i % 4 * 5}GB` : 'Unlimited',
      duration: type === 'time' ? `${7 + i % 3 * 10} days` : 'N/A',
      price: Math.round(price * 100) / 100,
      status,
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
      usedAt: status === 'used' ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000) : undefined,
      usedBy: status === 'used' ? `Customer-${Math.floor(Math.random() * 1000)}` : undefined,
      commission: Math.round(commission * 100) / 100,
    };
  });
};

const dailyStats: DailyStats = {
  vouchersCreated: 80,
  vouchersUsed: 23,
  commissionsEarned: 456.75,
  activeListings: 324,
  targetProgress: 4200,
  targetGoal: 5000,
};

export default function AgentDashboardPage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [voucherStatusFilter, setVoucherStatusFilter] = useState<string>('all');
  const activities = generateDailyActivities();
  const vouchers = generateAgentVouchers();

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities;
    return activities.filter(a => a.type === filterType);
  }, [filterType, activities]);

  const filteredVouchers = useMemo(() => {
    if (voucherStatusFilter === 'all') return vouchers;
    return vouchers.filter(v => v.status === voucherStatusFilter);
  }, [voucherStatusFilter, vouchers]);

  const targetPercentage = Math.round((dailyStats.targetProgress / dailyStats.targetGoal) * 100);
  const remainingTarget = dailyStats.targetGoal - dailyStats.targetProgress;

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
              My Activities
            </h1>
            <p className="text-muted-foreground mt-1">Today's performance and activity log</p>
          </div>
          <Badge className="h-fit capitalize">{mockAgent.tier}</Badge>
        </div>

        {/* Agent Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 bg-primary text-primary-foreground text-xl">
                  <AvatarFallback>
                    {mockAgent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{mockAgent.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {mockAgent.region}
                  </p>
                  <p className="text-sm text-muted-foreground">{mockAgent.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-green-500">${mockAgent.totalEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: 'Vouchers Created',
              value: dailyStats.vouchersCreated,
              icon: Ticket,
              color: 'text-blue-500',
            },
            {
              label: 'Vouchers Used',
              value: dailyStats.vouchersUsed,
              icon: CheckCircle,
              color: 'text-purple-500',
            },
            {
              label: 'Commission Earned',
              value: `$${dailyStats.commissionsEarned.toFixed(2)}`,
              icon: DollarSign,
              color: 'text-green-500',
            },
            {
              label: 'Active Listings',
              value: dailyStats.activeListings,
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

        {/* Monthly Target Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Monthly Target Progress
            </CardTitle>
            <CardDescription>
              ${dailyStats.targetProgress} of ${dailyStats.targetGoal}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Achievement</span>
                  <span className="text-muted-foreground">{targetPercentage}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${targetPercentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">Achieved</p>
                  <p className="text-lg font-bold mt-1">${dailyStats.targetProgress}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-lg font-bold text-orange-500 mt-1">${remainingTarget}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">Goal</p>
                  <p className="text-lg font-bold mt-1">${dailyStats.targetGoal}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                            <p className="text-lg font-bold">${voucher.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Commission</p>
                            <p className="text-sm font-semibold text-green-500">
                              +${voucher.commission.toFixed(2)}
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

        {/* Activity Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: 'Best Hour',
              value: '11:00 AM - 12:00 PM',
              description: '15 vouchers created',
              icon: TrendingUp,
              color: 'bg-blue-500/10 text-blue-500',
            },
            {
              label: 'Avg Voucher Value',
              value: '$45.50',
              description: 'Per transaction',
              icon: DollarSign,
              color: 'bg-green-500/10 text-green-500',
            },
            {
              label: 'Redemption Rate',
              value: '28.75%',
              description: 'Of created vouchers',
              icon: CheckCircle,
              color: 'bg-purple-500/10 text-purple-500',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </div>
                    <div className={cn('p-2 rounded-lg', stat.color)}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
