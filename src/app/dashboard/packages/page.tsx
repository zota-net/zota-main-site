'use client';

import React, { useState, useMemo } from 'react';
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

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  agentCommission: number;
  dataLimit: string;
  category: 'hotspot' | 'pppoe' | 'prepaid' | 'corporate' | 'guest';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  featured: boolean;
}

function generateMockPackages(): SubscriptionPackage[] {
  const names = ['Basic', 'Standard', 'Premium', 'Enterprise'];
  const categories: Array<SubscriptionPackage['category']> = ['hotspot', 'pppoe', 'prepaid'];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `pkg-${i}`,
    name: `${names[i % names.length]}-${i + 1}`,
    description: `Package ${i + 1}`,
    duration: (i + 1) * 10,
    price: (i + 1) * 100,
    agentCommission: 10,
    dataLimit: '10GB',
    category: categories[i % categories.length],
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    featured: false,
  }));
}

const initialPackages = generateMockPackages();

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
  const [packages, setPackages] = useState<SubscriptionPackage[]>(initialPackages);
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
    price: number;
    agentCommission: number;
    dataLimit: string;
    category: SubscriptionPackage['category'];
    status: SubscriptionPackage['status'];
    featured: boolean;
  }>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    agentCommission: 10,
    dataLimit: 'Unlimited',
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
      price: 0,
      agentCommission: 10,
      dataLimit: 'Unlimited',
      category: 'hotspot',
      status: 'active',
      featured: false,
    });
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

  const handleCreatePackage = () => {
    const newPackage: SubscriptionPackage = {
      id: `package-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      duration: formData.duration,
      price: formData.price,
      agentCommission: formData.agentCommission,
      dataLimit: formData.dataLimit,
      category: formData.category,
      status: formData.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      featured: formData.featured,
    };

    setPackages([newPackage, ...packages]);
    setCreateDialogOpen(false);
    resetForm();
    toast.success('Package created successfully');
  };

  const handleEditPackage = () => {
    if (!selectedPackage) return;

    setPackages(packages.map((p) =>
      p.id === selectedPackage.id
        ? {
            ...p,
            name: formData.name,
            description: formData.description,
            duration: formData.duration,
            price: formData.price,
            agentCommission: formData.agentCommission,
            dataLimit: formData.dataLimit,
            category: formData.category,
            status: formData.status,
            updatedAt: new Date(),
            featured: formData.featured,
          }
        : p
    ));
    setEditDialogOpen(false);
    setSelectedPackage(null);
    resetForm();
    toast.success('Package updated successfully');
  };

  const handleDeletePackage = () => {
    if (!selectedPackage) return;

    setPackages(packages.filter((p) => p.id !== selectedPackage.id));
    setDeleteDialogOpen(false);
    setSelectedPackage(null);
    toast.success('Package deleted successfully');
  };

  const handleDeleteSelected = () => {
    setPackages(packages.filter((p) => !selectedPackages.includes(p.id)));
    toast.success(`${selectedPackages.length} packages deleted`);
    setSelectedPackages([]);
  };

  const openEditDialog = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      agentCommission: pkg.agentCommission,
      dataLimit: pkg.dataLimit,
      category: pkg.category as SubscriptionPackage['category'],
      status: pkg.status as SubscriptionPackage['status'],
      featured: pkg.featured,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Duration (days)</Label>
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price ($)</Label>
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        />
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
                        <Label>Data Limit</Label>
                        <Input
                          value={formData.dataLimit}
                          onChange={(e) => setFormData({ ...formData, dataLimit: e.target.value })}
                          placeholder="e.g., 10GB, Unlimited"
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
                    <TableHead>Data Limit</TableHead>
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
                              <span className="text-sm">{pkg.duration}d</span>
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
                            {pkg.dataLimit}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
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
                  <Label>Data Limit</Label>
                  <Input
                    value={formData.dataLimit}
                    onChange={(e) => setFormData({ ...formData, dataLimit: e.target.value })}
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
