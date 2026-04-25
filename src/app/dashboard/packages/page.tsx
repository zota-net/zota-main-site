'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package as PackageIcon,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  MoreHorizontal,
  DollarSign,
  Clock,
  Percent,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { packagesService } from '@/lib/api/services/base-operations';
import type { Package } from '@/lib/api/types';
import { useUserStore } from '@/lib/store/user-store';
import { ApiError } from '@/lib/api/client';

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  duration: number;
  durationUnit: 'minutes' | 'hours' | 'days';
  periodSeconds: number;
  price: number;
  agentCommission: number;
  ratelimit: number;
  category: 'hotspot' | 'pppoe' | 'prepaid' | 'corporate' | 'guest';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  featured: boolean;
}



const categoryConfig: Record<SubscriptionPackage['category'], { label: string; color: string }> = {
  hotspot: { label: 'Hotspot', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  pppoe: { label: 'PPPoE', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  prepaid: { label: 'Prepaid', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  corporate: { label: 'Corporate', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  guest: { label: 'Guest', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: XCircle },
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUserStore((state) => state.user);

  const fetchPackages = useCallback(async () => {
    const clientId = user?.client_id;
    if (!clientId) return;

    try {
      setLoading(true);
      const data = await packagesService.getByClient(clientId);
      const mapped: SubscriptionPackage[] = (Array.isArray(data) ? data : []).map((p: Package) => {
        const periodSeconds = Number(p.period ?? 0)
        const { value, unit } = secondsToBestUnit(periodSeconds)  // ← smart conversion

        return {
          id: String(p.id),
          name: String(p.title ?? ''),
          description: String(p.title ?? ''),
          duration: value,          // ← e.g. 30 (not always days)
          durationUnit: unit,       // ← e.g. 'hours' | 'days' | 'minutes'
          periodSeconds,            // ← keep raw seconds for API calls
          price: Number(p.price ?? 0),
          agentCommission: Number(p.agentComissionPercentage ?? 0),
          ratelimit: Number(p.ratelimit ?? 0),
          category: 'hotspot' as const,
          status: 'active' as const,
          createdAt: new Date(String(p.createdAt ?? '')),
          updatedAt: new Date(String(p.updatedAt ?? '')),
          usageCount: 0,
          featured: false,
        }
      });
      setPackages(mapped);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  }, [user?.client_id]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    duration: number;
    durationUnit: 'minutes' | 'hours' | 'days';
    price: number;
    agentCommission: number;
    ratelimit: number;
    category: SubscriptionPackage['category'];
    status: SubscriptionPackage['status'];
    featured: boolean;
  }>({
    name: '',
    description: '',
    duration: 30,
    durationUnit: 'days',
    price: 0,
    agentCommission: 10,
    ratelimit: 100,
    category: 'hotspot',
    status: 'active',
    featured: false,
  });

  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [packages, searchQuery, categoryFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: packages.length,
    active: packages.filter((p) => p.status === 'active').length,
    featured: packages.filter((p) => p.featured && p.status === 'active').length,
    totalUsage: packages.reduce((sum, p) => sum + p.usageCount, 0),
  }), [packages]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 30,
      durationUnit: 'days',
      price: 0,
      agentCommission: 10,
      ratelimit: 100,
      category: 'hotspot',
      status: 'active',
      featured: false,
    });
  };

  const convertDurationToSeconds = (duration: number, unit: 'minutes' | 'hours' | 'days'): number => {
    switch (unit) {
      case 'minutes':
        return duration * 60;
      case 'hours':
        return duration * 3600;
      case 'days':
        return duration * 86400;
      default:
        return duration * 86400;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPackages(filteredPackages.map((p) => p.id));
    } else {
      setSelectedPackages([]);
    }
  };

  const handleSelectPackage = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPackages([...selectedPackages, id]);
    } else {
      setSelectedPackages(selectedPackages.filter((p) => p !== id));
    }
  };

  const handleCreatePackage = async () => {
    if (!user?.client_id) {
      toast.error('Unable to create package: missing client ID');
      return;
    }

    if (formData.price < 500) {
      toast.error('Minimum price is 500');
      return;
    }

    try {
      const periodInSeconds = convertDurationToSeconds(formData.duration, formData.durationUnit);
      await packagesService.create({
        clientId: user.client_id,
        title: formData.name,
        period: periodInSeconds,
        price: formData.price,
        ratelimit: formData.ratelimit,
        agentComissionPercentage: formData.agentCommission,
      });
      setCreateDialogOpen(false);
      resetForm();
      toast.success('Package created successfully');
      fetchPackages();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create package');
    }
  };

  const handleEditPackage = async () => {
    if (!selectedPackage) return;

    if (formData.price < 500) {
      toast.error('Minimum price is 500');
      return;
    }

    try {
      const periodInSeconds = convertDurationToSeconds(formData.duration, formData.durationUnit);
      await packagesService.update(selectedPackage.id, {
        title: formData.name,
        period: periodInSeconds,
        price: formData.price,
        ratelimit: formData.ratelimit,
        agentComissionPercentage: formData.agentCommission,
      });
      setEditDialogOpen(false);
      setSelectedPackage(null);
      resetForm();
      toast.success('Package updated successfully');
      fetchPackages();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update package');
    }
  };

  const handleDeletePackage = async () => {
    if (!selectedPackage) return;

    try {
      await packagesService.delete(selectedPackage.id);
      setDeleteDialogOpen(false);
      setSelectedPackage(null);
      toast.success('Package deleted successfully');
      fetchPackages();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete package');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedPackages.map((id) => packagesService.delete(id)));
      toast.success(`${selectedPackages.length} packages deleted`);
      setSelectedPackages([]);
      fetchPackages();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete packages');
    }
  };

  const openEditDialog = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description,
      duration: pkg.duration,
      durationUnit: pkg.durationUnit,   // ← was hardcoded 'days' before
      price: pkg.price,
      agentCommission: pkg.agentCommission,
      ratelimit: pkg.ratelimit,
      category: pkg.category,
      status: pkg.status,
      featured: pkg.featured,
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Converts seconds → best human-readable { value, unit }
  function secondsToBestUnit(seconds: number): { value: number; unit: 'minutes' | 'hours' | 'days' } {
    if (seconds < 3600) {
      // Under 1 hour → show in minutes
      return { value: Math.round(seconds / 60), unit: 'minutes' }
    } else if (seconds < 86400) {
      // Under 1 day → show in hours
      return { value: Math.round(seconds / 3600), unit: 'hours' }
    } else {
      // 1 day or more → show in days
      return { value: Math.round(seconds / 86400), unit: 'days' }
    }
  }

  // Formats for display in the table e.g. "30d", "6h", "45m"
  function formatPeriodDisplay(seconds: number): string {
    const { value, unit } = secondsToBestUnit(seconds)
    const labels = { minutes: 'm', hours: 'h', days: 'd' }
    return `${value}${labels[unit]}`
  }



  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PackageIcon className="h-6 w-6" />
            Package Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage subscription packages for vouchers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Packages', value: stats.total, color: 'text-primary', icon: PackageIcon },
            { label: 'Active', value: stats.active, color: 'text-green-500', icon: CheckCircle },
            { label: 'Featured', value: stats.featured, color: 'text-purple-500', icon: PackageIcon },
            { label: 'Total Usage', value: stats.totalUsage, color: 'text-blue-500', icon: DollarSign },
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
                  <p className={cn('text-3xl font-bold mt-2', stat.color)}>
                    <AnimatedCounter value={stat.value} />
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Packages Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search packages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hotspot">Hotspot</SelectItem>
                    <SelectItem value="pppoe">PPPoE</SelectItem>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
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
                  </SelectContent>
                </Select>
              </div>

              {selectedPackages.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedPackages.length} selected
                  </span>
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}

              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Package</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Package Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Premium 30-Day"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Package description"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select
                          value={formData.durationUnit}
                          onValueChange={(value: any) => setFormData({ ...formData, durationUnit: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Price (UGX)</Label>
                        <Input
                          type="number"
                          min="500"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">Minimum: 500</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Agent Commission (%)</Label>
                        <Input
                          type="number"
                          value={formData.agentCommission}
                          onChange={(e) => setFormData({ ...formData, agentCommission: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ratelimit (MB)</Label>
                        <Input
                          type="number"
                          value={formData.ratelimit}
                          onChange={(e) => setFormData({ ...formData, ratelimit: parseInt(e.target.value) })}
                          placeholder="e.g., 100"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hotspot">Hotspot</SelectItem>
                          <SelectItem value="pppoe">PPPoE</SelectItem>
                          <SelectItem value="prepaid">Prepaid</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                      />
                      <span className="text-sm font-medium">Featured Package</span>
                    </label>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePackage}>
                      Create Package
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPackages.length === filteredPackages.length && filteredPackages.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Speed Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredPackages.slice(0, 20).map((pkg) => {
                      const categoryInfo = categoryConfig[pkg.category];
                      const statusInfo = statusConfig[pkg.status];
                      const StatusIcon = statusInfo.icon;

                      return (
                        <motion.tr
                          key={pkg.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedPackages.includes(pkg.id)}
                              onCheckedChange={(checked) => handleSelectPackage(pkg.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{pkg.name}</p>
                              <p className="text-sm text-muted-foreground">{pkg.description}</p>
                              {pkg.featured && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={categoryInfo.color}>
                              {categoryInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatPeriodDisplay(pkg.periodSeconds)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(pkg.price)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Percent className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{pkg.agentCommission}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {pkg.ratelimit}MB/{pkg.ratelimit}MB
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(pkg)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(pkg)}
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

            {filteredPackages.length === 0 && (
              <div className="text-center py-12">
                <PackageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No packages found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Package Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Package</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={formData.durationUnit}
                    onValueChange={(value: any) => setFormData({ ...formData, durationUnit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (UGX)</Label>
                  <Input
                    type="number"
                    min="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Minimum: 500</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Agent Commission (%)</Label>
                  <Input
                    type="number"
                    value={formData.agentCommission}
                    onChange={(e) => setFormData({ ...formData, agentCommission: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ratelimit (MB)</Label>
                  <Input
                    type="number"
                    value={formData.ratelimit}
                    onChange={(e) => setFormData({ ...formData, ratelimit: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotspot">Hotspot</SelectItem>
                    <SelectItem value="pppoe">PPPoE</SelectItem>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                />
                <span className="text-sm font-medium">Featured Package</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleEditPackage}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Package Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Package</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedPackage?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePackage} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
