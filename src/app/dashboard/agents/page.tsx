'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  MoreHorizontal,
  Mail,
  TrendingUp,
  Award,
  DollarSign,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Eye,
  MapPin,
  Locate,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogTrigger,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageTransition, AnimatedCounter } from '@/components/common';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Agent types
interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  commissionRate: number; // percentage
  totalVouchersSold: number;
  totalEarnings: number;
  avatar?: string;
  createdAt: Date;
  lastActive?: Date;
  region?: string;
  monthlyTarget: number;
  monthlyAchieved: number;
}

// Generate mock agents
const generateAgents = (): Agent[] => {
  const tiers: Agent['tier'][] = ['bronze', 'silver', 'gold', 'platinum'];
  const statuses: Agent['status'][] = ['active', 'inactive', 'suspended', 'pending'];
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const firstNames = ['James', 'Patricia', 'Michael', 'Linda', 'Robert', 'Barbara', 'William', 'Nancy', 'David', 'Chris'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  return Array.from({ length: 32 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const tier = i < 4 ? tiers[i] : tiers[Math.floor(Math.random() * tiers.length)];
    const status = i < 25 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)];
    const commissionRate = tier === 'platinum' ? 15 : tier === 'gold' ? 12 : tier === 'silver' ? 10 : 8;
    const monthlyTarget = tier === 'platinum' ? 5000 : tier === 'gold' ? 3500 : tier === 'silver' ? 2500 : 1500;
    const monthlyAchieved = Math.floor(monthlyTarget * (0.6 + Math.random() * 0.5));

    return {
      id: `agent-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@agents.com`,
      phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      tier,
      status: status,
      commissionRate,
      totalVouchersSold: Math.floor(Math.random() * 1000) + 50,
      totalEarnings: Math.floor(Math.random() * 50000) + 5000,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastActive: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      region: regions[Math.floor(Math.random() * regions.length)],
      monthlyTarget,
      monthlyAchieved,
    };
  });
};

const initialAgents = generateAgents();

const tierConfig = {
  bronze: { label: 'Bronze', color: 'bg-amber-600/10 text-amber-600 border-amber-600/20', icon: Award },
  silver: { label: 'Silver', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Award },
  gold: { label: 'Gold', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Award },
  platinum: { label: 'Platinum', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Award },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: XCircle },
  suspended: { label: 'Suspended', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: Ban },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [locationMode, setLocationMode] = useState<'current' | 'custom'>('current');
  const [customLocation, setCustomLocation] = useState('');
  const [agentLocation, setAgentLocation] = useState('');

  // New/Edit agent form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'bronze' as Agent['tier'],
    region: '',
    status: 'active' as Agent['status'],
    commissionRate: 8,
    monthlyTarget: 1500,
  });

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = tierFilter === 'all' || a.tier === tierFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [agents, searchQuery, tierFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: agents.length,
    active: agents.filter((a) => a.status === 'active').length,
    totalEarnings: agents.reduce((sum, a) => sum + a.totalEarnings, 0),
    totalVouchers: agents.reduce((sum, a) => sum + a.totalVouchersSold, 0),
  }), [agents]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAgents(filteredAgents.map((a) => a.id));
    } else {
      setSelectedAgents([]);
    }
  };

  const handleSelectAgent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents([...selectedAgents, id]);
    } else {
      setSelectedAgents(selectedAgents.filter((a) => a !== id));
    }
  };

  const handleCreateAgent = () => {
    const tierCommissionMap = {
      bronze: 8,
      silver: 10,
      gold: 12,
      platinum: 15,
    };

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tier: formData.tier,
      status: formData.status,
      commissionRate: tierCommissionMap[formData.tier],
      totalVouchersSold: 0,
      totalEarnings: 0,
      createdAt: new Date(),
      region: formData.region,
      monthlyTarget: formData.monthlyTarget,
      monthlyAchieved: 0,
    };

    setAgents([newAgent, ...agents]);
    setCreateDialogOpen(false);
    resetForm();
    toast.success('Agent created successfully');
  };

  const handleEditAgent = () => {
    if (!selectedAgent) return;

    const tierCommissionMap = {
      bronze: 8,
      silver: 10,
      gold: 12,
      platinum: 15,
    };

    setAgents(agents.map((a) =>
      a.id === selectedAgent.id
        ? {
            ...a,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            tier: formData.tier,
            status: formData.status,
            commissionRate: tierCommissionMap[formData.tier],
            region: formData.region,
            monthlyTarget: formData.monthlyTarget,
          }
        : a
    ));
    setEditDialogOpen(false);
    setSelectedAgent(null);
    resetForm();
    toast.success('Agent updated successfully');
  };

  const handleDeleteAgent = () => {
    if (!selectedAgent) return;

    setAgents(agents.filter((a) => a.id !== selectedAgent.id));
    setDeleteDialogOpen(false);
    setSelectedAgent(null);
    toast.success('Agent deleted successfully');
  };

  const handleDeleteSelected = () => {
    setAgents(agents.filter((a) => !selectedAgents.includes(a.id)));
    toast.success(`${selectedAgents.length} agents deleted`);
    setSelectedAgents([]);
  };

  const handleSuspendAgent = (id: string) => {
    setAgents(agents.map((a) =>
      a.id === id ? { ...a, status: 'suspended' as const } : a
    ));
    toast.success('Agent suspended');
  };

  const handleActivateAgent = (id: string) => {
    setAgents(agents.map((a) =>
      a.id === id ? { ...a, status: 'active' as const } : a
    ));
    toast.success('Agent activated');
  };

  const openEditDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone || '',
      tier: agent.tier,
      region: agent.region || '',
      status: agent.status,
      commissionRate: agent.commissionRate,
      monthlyTarget: agent.monthlyTarget,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setDeleteDialogOpen(true);
  };

  const openDetailDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setAgentLocation(agent.region || '');
    setLocationMode('current');
    setCustomLocation('');
    setDetailDialogOpen(true);
  };

  const handleGetCurrentLocation = () => {
    setLocationMode('current');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setAgentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast.success('Location retrieved successfully');
        },
        () => {
          toast.error('Unable to get current location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleSaveLocation = () => {
    const newLocation = locationMode === 'current' ? agentLocation : customLocation;
    if (!newLocation.trim()) {
      toast.error('Please select or enter a location');
      return;
    }
    setAgents(agents.map(a => 
      a.id === selectedAgent?.id ? { ...a, region: newLocation } : a
    ));
    toast.success('Location updated successfully');
    setDetailDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      tier: 'bronze',
      region: '',
      status: 'active',
      commissionRate: 8,
      monthlyTarget: 1500,
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const formatLastActive = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Agent Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage voucher agents, commissions, and performance metrics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 sm:h-9">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-8 sm:h-9">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Agent</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Create New Agent</DialogTitle>
                  <DialogDescription className="text-sm">
                    Register a new voucher sales agent
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Full Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@agents.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 555-555-5555"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Region</Label>
                      <Input
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        placeholder="North"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Tier</Label>
                      <Select
                        value={formData.tier}
                        onValueChange={(value: Agent['tier']) => setFormData({ ...formData, tier: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bronze">Bronze (8%)</SelectItem>
                          <SelectItem value="silver">Silver (10%)</SelectItem>
                          <SelectItem value="gold">Gold (12%)</SelectItem>
                          <SelectItem value="platinum">Platinum (15%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: Agent['status']) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Monthly Target ($)</Label>
                    <Input
                      type="number"
                      value={formData.monthlyTarget}
                      onChange={(e) => setFormData({ ...formData, monthlyTarget: parseInt(e.target.value) || 0 })}
                      placeholder="1500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAgent} disabled={!formData.name || !formData.email}>
                    Create Agent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Agents', value: stats.total, color: 'text-primary', icon: UserCheck },
            { label: 'Active Agents', value: stats.active, color: 'text-green-500', icon: CheckCircle },
            { label: 'Total Vouchers Sold', value: stats.totalVouchers, color: 'text-blue-500', icon: TrendingUp },
            { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), color: 'text-green-600', icon: DollarSign, isFormatted: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                  {stat.isFormatted ? (
                    <p className={cn('text-2xl font-bold mt-2', stat.color)}>
                      {stat.value}
                    </p>
                  ) : (
                    <p className={cn('text-3xl font-bold mt-2', stat.color)}>
                      <AnimatedCounter value={stat.value as number} />
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedAgents.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedAgents.length} selected
                  </span>
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedAgents.length === filteredAgents.length && filteredAgents.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Vouchers Sold</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredAgents.slice(0, 20).map((agent) => {
                      const tierInfo = tierConfig[agent.tier];
                      const statusInfo = statusConfig[agent.status];
                      const TierIcon = tierInfo.icon;
                      const StatusIcon = statusInfo.icon;

                      return (
                        <motion.tr
                          key={agent.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedAgents.includes(agent.id)}
                              onCheckedChange={(checked) => handleSelectAgent(agent.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={agent.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(agent.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{agent.name}</p>
                                <p className="text-sm text-muted-foreground">{agent.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={tierInfo.color}>
                              <TierIcon className="h-3 w-3 mr-1" />
                              {tierInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {agent.commissionRate}%
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {agent.totalVouchersSold}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(agent.totalEarnings)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatLastActive(agent.lastActive)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openDetailDialog(agent)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(agent)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {agent.status === 'active' ? (
                                  <DropdownMenuItem onClick={() => handleSuspendAgent(agent.id)}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleActivateAgent(agent.id)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(agent)}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
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

            {filteredAgents.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No agents found</p>
              </div>
            )}

            {filteredAgents.length > 20 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing 20 of {filteredAgents.length} agents
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Agent Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Edit Agent</DialogTitle>
              <DialogDescription className="text-sm">
                Update agent information and settings
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@agents.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555-555-5555"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Region</Label>
                  <Input
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="North"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Tier</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value: Agent['tier']) => setFormData({ ...formData, tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze (8%)</SelectItem>
                      <SelectItem value="silver">Silver (10%)</SelectItem>
                      <SelectItem value="gold">Gold (12%)</SelectItem>
                      <SelectItem value="platinum">Platinum (15%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Agent['status']) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Monthly Target ($)</Label>
                <Input
                  type="number"
                  value={formData.monthlyTarget}
                  onChange={(e) => setFormData({ ...formData, monthlyTarget: parseInt(e.target.value) || 0 })}
                  placeholder="1500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleEditAgent}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Agent Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Agent</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedAgent?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAgent} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Agent Details Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agent Details</DialogTitle>
              <DialogDescription>
                View and manage agent information and location
              </DialogDescription>
            </DialogHeader>
            {selectedAgent && (
              <div className="space-y-6">
                {/* Agent Overview */}
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedAgent.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedAgent.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {selectedAgent.email}
                    </p>
                    {selectedAgent.phone && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedAgent.phone}</p>
                    )}
                  </div>
                </div>

                {/* Agent Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Commission Rate</p>
                    <p className="text-xl font-bold mt-1">{selectedAgent.commissionRate}%</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Tier</p>
                    <Badge className="mt-2 capitalize">{selectedAgent.tier}</Badge>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Vouchers Sold</p>
                    <p className="text-xl font-bold mt-1">{selectedAgent.totalVouchersSold}</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                    <p className="text-lg font-bold mt-1">${selectedAgent.totalEarnings}</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className="mt-2 capitalize">{selectedAgent.status}</Badge>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Monthly Target</p>
                    <p className="text-xl font-bold mt-1">${selectedAgent.monthlyTarget}</p>
                  </div>
                </div>

                {/* Location Selection */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Management
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Current Location Option */}
                    <div 
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors",
                        locationMode === 'current' ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                      )}
                      onClick={() => setLocationMode('current')}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          checked={locationMode === 'current'}
                          onChange={() => setLocationMode('current')}
                          className="cursor-pointer"
                        />
                        <label className="font-medium cursor-pointer flex-1">Pick Current Location</label>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGetCurrentLocation();
                          }}
                          className="gap-1"
                        >
                          <Locate className="h-3 w-3" />
                          Get Location
                        </Button>
                      </div>
                      {locationMode === 'current' && agentLocation && (
                        <p className="text-sm text-muted-foreground ml-6 p-2 bg-background rounded border">
                          {agentLocation}
                        </p>
                      )}
                    </div>

                    {/* Custom Location Option */}
                    <div 
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors",
                        locationMode === 'custom' ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                      )}
                      onClick={() => setLocationMode('custom')}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          checked={locationMode === 'custom'}
                          onChange={() => setLocationMode('custom')}
                          className="cursor-pointer"
                        />
                        <label className="font-medium cursor-pointer flex-1">Custom Location</label>
                      </div>
                      <Input 
                        placeholder="Enter custom location (address, region, coordinates)"
                        value={locationMode === 'custom' ? customLocation : (selectedAgent.region || '')}
                        onChange={(e) => {
                          setLocationMode('custom');
                          setCustomLocation(e.target.value);
                        }}
                        className="ml-6"
                      />
                    </div>
                  </div>

                  {/* Current Location Display */}
                  {selectedAgent.region && (
                    <div className="p-2 bg-muted rounded text-sm">
                      <p className="text-muted-foreground mb-1">Current Region:</p>
                      <p className="font-medium">{selectedAgent.region}</p>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(selectedAgent.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Active</p>
                    <p className="font-medium">
                      {selectedAgent.lastActive ? new Date(selectedAgent.lastActive).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly Achieved</p>
                    <p className="font-medium">${selectedAgent.monthlyAchieved}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Progress</p>
                    <p className="font-medium">
                      {((selectedAgent.monthlyAchieved / selectedAgent.monthlyTarget) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={handleSaveLocation}>
                Save Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
