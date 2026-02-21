'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Ticket,
  Plus,
  Search,
  Download,
  Trash2,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Filter,
  RefreshCw,
  Printer,
  QrCode,
  CalendarIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PageTransition, AnimatedCounter } from '@/components/common';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Voucher types
type VoucherCategory = 'hotspot' | 'pppoe' | 'prepaid' | 'corporate' | 'guest';

interface Voucher {
  id: string;
  code: string;
  type: 'time' | 'data' | 'unlimited';
  category: VoucherCategory;
  value: string;
  duration: string;
  status: 'active' | 'used' | 'expired' | 'revoked';
  createdAt: Date;
  startDate: Date;
  usedAt?: Date;
  usedBy?: string;
  expiresAt: Date;
  batchId?: string;
}

// Category configuration
const categoryConfig: Record<VoucherCategory, { label: string; color: string; description: string }> = {
  hotspot: { label: 'Hotspot', color: 'bg-orange-500/10 text-orange-500', description: 'WiFi hotspot access' },
  pppoe: { label: 'PPPoE', color: 'bg-blue-500/10 text-blue-500', description: 'Point-to-Point Protocol' },
  prepaid: { label: 'Prepaid', color: 'bg-green-500/10 text-green-500', description: 'Prepaid data packages' },
  corporate: { label: 'Corporate', color: 'bg-purple-500/10 text-purple-500', description: 'Business accounts' },
  guest: { label: 'Guest', color: 'bg-gray-500/10 text-gray-500', description: 'Temporary guest access' },
};

// Generate mock vouchers
const generateVouchers = (): Voucher[] => {
  const types: Voucher['type'][] = ['time', 'data', 'unlimited'];
  const categories: VoucherCategory[] = ['hotspot', 'pppoe', 'prepaid', 'corporate', 'guest'];
  const statuses: Voucher['status'][] = ['active', 'used', 'expired', 'revoked'];
  const durations = ['1 Hour', '3 Hours', '1 Day', '7 Days', '30 Days'];
  const values = ['100MB', '500MB', '1GB', '5GB', 'Unlimited'];
  
  return Array.from({ length: 50 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const startDate = new Date(createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(startDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);
    
    return {
      id: `voucher-${i + 1}`,
      code: `NET-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type,
      category,
      value: type === 'time' ? durations[Math.floor(Math.random() * durations.length)] : values[Math.floor(Math.random() * values.length)],
      duration: durations[Math.floor(Math.random() * durations.length)],
      status,
      createdAt,
      startDate,
      usedAt: status === 'used' ? new Date(startDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000) : undefined,
      usedBy: status === 'used' ? `user${Math.floor(Math.random() * 100)}@example.com` : undefined,
      expiresAt,
      batchId: `BATCH-${Math.floor(Math.random() * 10) + 1}`,
    };
  });
};

const initialVouchers = generateVouchers();

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  used: { label: 'Used', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Check },
  expired: { label: 'Expired', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  revoked: { label: 'Revoked', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

const typeConfig = {
  time: { label: 'Time-based', color: 'bg-purple-500/10 text-purple-500' },
  data: { label: 'Data-based', color: 'bg-cyan-500/10 text-cyan-500' },
  unlimited: { label: 'Unlimited', color: 'bg-amber-500/10 text-amber-500' },
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [datePickerStep, setDatePickerStep] = useState<'start' | 'end'>('start');
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // New voucher form
  const [newVoucher, setNewVoucher] = useState({
    type: 'time' as Voucher['type'],
    category: 'hotspot' as VoucherCategory,
    value: '1 Hour',
    duration: '1 Day',
    quantity: 10,
    prefix: 'NET',
    startDate: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // Filter vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchesSearch = v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.batchId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      
      // Date range filter (filters by createdAt date)
      const voucherDate = new Date(v.createdAt);
      const matchesDateFrom = !dateFrom || voucherDate >= dateFrom;
      const matchesDateTo = !dateTo || voucherDate <= new Date(dateTo.getTime() + 24 * 60 * 60 * 1000 - 1);
      
      return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [vouchers, searchQuery, statusFilter, typeFilter, dateFrom, dateTo]);

  // Clear date filter
  const clearDateFilter = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setDatePickerStep('start');
  };

  // Handle date selection with cycling behavior
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (datePickerStep === 'start') {
      // First click: set start date, clear end date
      setDateFrom(date);
      setDateTo(undefined);
      setDatePickerStep('end');
    } else {
      // Second click: set end date
      // If selected date is before start date, swap them
      if (dateFrom && date < dateFrom) {
        setDateTo(dateFrom);
        setDateFrom(date);
      } else {
        setDateTo(date);
      }
      setDatePickerStep('start');
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: vouchers.length,
    active: vouchers.filter((v) => v.status === 'active').length,
    used: vouchers.filter((v) => v.status === 'used').length,
    expired: vouchers.filter((v) => v.status === 'expired').length,
  }), [vouchers]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Voucher code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVouchers(filteredVouchers.map((v) => v.id));
    } else {
      setSelectedVouchers([]);
    }
  };

  const handleSelectVoucher = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedVouchers([...selectedVouchers, id]);
    } else {
      setSelectedVouchers(selectedVouchers.filter((v) => v !== id));
    }
  };

  const handleCreateVouchers = () => {
    const newVouchers: Voucher[] = Array.from({ length: newVoucher.quantity }, (_, i) => ({
      id: `voucher-${Date.now()}-${i}`,
      code: `${newVoucher.prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type: newVoucher.type,
      category: newVoucher.category,
      value: newVoucher.value,
      duration: newVoucher.duration,
      status: 'active' as const,
      createdAt: new Date(),
      startDate: newVoucher.startDate,
      expiresAt: newVoucher.expiresAt,
      batchId: `BATCH-${Date.now()}`,
    }));
    
    setVouchers([...newVouchers, ...vouchers]);
    setCreateDialogOpen(false);
    toast.success(`${newVoucher.quantity} vouchers created successfully`);
  };

  const handleDeleteSelected = () => {
    setVouchers(vouchers.filter((v) => !selectedVouchers.includes(v.id)));
    toast.success(`${selectedVouchers.length} vouchers deleted`);
    setSelectedVouchers([]);
  };

  const handleRevokeSelected = () => {
    setVouchers(vouchers.map((v) => 
      selectedVouchers.includes(v.id) ? { ...v, status: 'revoked' as const } : v
    ));
    toast.success(`${selectedVouchers.length} vouchers revoked`);
    setSelectedVouchers([]);
  };

  const handleMarkAsUsed = () => {
    setVouchers(vouchers.map((v) => 
      selectedVouchers.includes(v.id) ? { ...v, status: 'used' as const, usedAt: new Date() } : v
    ));
    toast.success(`${selectedVouchers.length} vouchers marked as used`);
    setSelectedVouchers([]);
  };

  const handleMarkAsExpired = () => {
    setVouchers(vouchers.map((v) => 
      selectedVouchers.includes(v.id) ? { ...v, status: 'expired' as const } : v
    ));
    toast.success(`${selectedVouchers.length} vouchers marked as expired`);
    setSelectedVouchers([]);
  };

  const handleResetValidity = () => {
    const newStartDate = new Date();
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    setVouchers(vouchers.map((v) => 
      selectedVouchers.includes(v.id) ? { 
        ...v, 
        status: 'active' as const,
        startDate: newStartDate,
        expiresAt: newExpiresAt,
        usedAt: undefined,
        usedBy: undefined
      } : v
    ));
    toast.success(`${selectedVouchers.length} vouchers reset`);
    setSelectedVouchers([]);
  };

  const handlePrintSelected = () => {
    const selectedVoucherData = vouchers.filter((v) => selectedVouchers.includes(v.id));
    const printContent = selectedVoucherData.map(v => v.code).join('\n');
    navigator.clipboard.writeText(printContent);
    toast.success('Voucher codes copied for printing');
    window.print();
  };

  const handleRevokeVoucher = (id: string) => {
    setVouchers(vouchers.map((v) => 
      v.id === id ? { ...v, status: 'revoked' as const } : v
    ));
    toast.success('Voucher revoked');
  };

  const handleDeleteVoucher = (id: string) => {
    setVouchers(vouchers.filter((v) => v.id !== id));
    toast.success('Voucher deleted');
  };

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Voucher Manager
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Generate, manage, and track network access vouchers
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 sm:h-9">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 sm:h-9">
              <Printer className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white font-semibold shadow-lg shadow-[#FF6A00]/25 ring-2 ring-[#FF6A00]/20 focus:ring-4 focus:ring-[#FF6A00]/40 transition-all h-8 sm:h-9">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Generate Vouchers</span>
                  <span className="sm:hidden">Generate</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Generate New Vouchers</DialogTitle>
                  <DialogDescription className="text-sm">
                    Create a batch of vouchers for network access
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                  {/* Voucher Category */}
                  <div className="space-y-2">
                    <Label className="text-sm">Voucher Category</Label>
                    <Select
                      value={newVoucher.category}
                      onValueChange={(value: VoucherCategory) => setNewVoucher({ ...newVoucher, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{config.label}</span>
                              <span className="text-xs text-muted-foreground">- {config.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Voucher Type</Label>
                      <Select
                        value={newVoucher.type}
                        onValueChange={(value: Voucher['type']) => setNewVoucher({ ...newVoucher, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="time">Time-based</SelectItem>
                          <SelectItem value="data">Data-based</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Select
                        value={newVoucher.value}
                        onValueChange={(value) => setNewVoucher({ ...newVoucher, value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {newVoucher.type === 'time' ? (
                            <>
                              <SelectItem value="1 Hour">1 Hour</SelectItem>
                              <SelectItem value="3 Hours">3 Hours</SelectItem>
                              <SelectItem value="1 Day">1 Day</SelectItem>
                              <SelectItem value="7 Days">7 Days</SelectItem>
                              <SelectItem value="30 Days">30 Days</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="100MB">100 MB</SelectItem>
                              <SelectItem value="500MB">500 MB</SelectItem>
                              <SelectItem value="1GB">1 GB</SelectItem>
                              <SelectItem value="5GB">5 GB</SelectItem>
                              <SelectItem value="Unlimited">Unlimited</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Validity Period with Calendar */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newVoucher.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newVoucher.startDate ? format(newVoucher.startDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newVoucher.startDate}
                            onSelect={(date) => date && setNewVoucher({ ...newVoucher, startDate: date })}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newVoucher.expiresAt && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newVoucher.expiresAt ? format(newVoucher.expiresAt, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newVoucher.expiresAt}
                            onSelect={(date) => date && setNewVoucher({ ...newVoucher, expiresAt: date })}
                            disabled={(date) => date <= newVoucher.startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        value={newVoucher.quantity}
                        onChange={(e) => setNewVoucher({ ...newVoucher, quantity: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Code Prefix</Label>
                      <Input
                        value={newVoucher.prefix}
                        onChange={(e) => setNewVoucher({ ...newVoucher, prefix: e.target.value.toUpperCase() })}
                        placeholder="NET"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  
                  {/* Voucher Preview */}
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm font-medium mb-3">Voucher Preview</p>
                    <div className="flex flex-wrap gap-2 text-xs mb-3">
                      <Badge className={categoryConfig[newVoucher.category].color}>
                        {categoryConfig[newVoucher.category].label}
                      </Badge>
                      <Badge className={typeConfig[newVoucher.type].color}>
                        {typeConfig[newVoucher.type].label}
                      </Badge>
                      <Badge variant="outline">
                        {format(newVoucher.startDate, "MMM d")} - {format(newVoucher.expiresAt, "MMM d, yyyy")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Example Code</p>
                        <code className="font-mono text-sm font-semibold text-primary">
                          {newVoucher.prefix}-XXXX-XXXX
                        </code>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Value</p>
                        <span className="text-sm font-medium">{newVoucher.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleCreateVouchers();
                      setTimeout(() => {
                        window.print();
                      }, 500);
                    }}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Generate & Print
                  </Button>
                  <Button 
                    onClick={handleCreateVouchers}
                    className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white font-semibold shadow-lg shadow-[#FF6A00]/25 ring-2 ring-[#FF6A00]/20 focus:ring-4 focus:ring-[#FF6A00]/40 transition-all"
                  >
                    Generate {newVoucher.quantity} Vouchers
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Vouchers', value: stats.total, color: 'text-primary' },
            { label: 'Active', value: stats.active, color: 'text-green-500' },
            { label: 'Used', value: stats.used, color: 'text-blue-500' },
            { label: 'Expired', value: stats.expired, color: 'text-yellow-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-3 sm:pt-6 sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <Ticket className={cn('h-3 w-3 sm:h-4 sm:w-4', stat.color)} />
                  </div>
                  <p className={cn('text-xl sm:text-3xl font-bold mt-1 sm:mt-2', stat.color)}>
                    <AnimatedCounter value={stat.value} />
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters & Table */}
        <Card>
          <CardHeader className="space-y-4">
            {/* Search and Filters Row */}
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vouchers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="time">Time-based</SelectItem>
                    <SelectItem value="data">Data-based</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Date Range Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-auto justify-start text-left font-normal h-10",
                        (dateFrom || dateTo) && "bg-[#FF6A00]/10 border-[#FF6A00]/50 text-[#FF6A00]"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? (
                        dateTo ? (
                          <span className="text-sm">
                            {format(dateFrom, "MMM d")} - {format(dateTo, "MMM d")}
                          </span>
                        ) : (
                          <span className="text-sm">{format(dateFrom, "MMM d")} - ...</span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-sm">Date Range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">Select Date Range</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {datePickerStep === 'start' ? (
                              <span className="text-[#FF6A00]">Click to set start date</span>
                            ) : (
                              <span className="text-[#FF6A00]">Click to set end date</span>
                            )}
                          </p>
                        </div>
                        {(dateFrom || dateTo) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearDateFilter}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {/* Selected range display */}
                      {(dateFrom || dateTo) && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Badge variant="outline" className={cn(
                            "font-mono",
                            datePickerStep === 'start' && !dateTo && "border-[#FF6A00] text-[#FF6A00]"
                          )}>
                            {dateFrom ? format(dateFrom, "MMM d, yyyy") : "---"}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="outline" className={cn(
                            "font-mono",
                            datePickerStep === 'end' && "border-[#FF6A00] text-[#FF6A00]"
                          )}>
                            {dateTo ? format(dateTo, "MMM d, yyyy") : "---"}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Calendar
                      mode="single"
                      selected={datePickerStep === 'start' ? dateFrom : dateTo}
                      onSelect={handleDateSelect}
                      modifiers={{
                        range_start: dateFrom ? [dateFrom] : [],
                        range_end: dateTo ? [dateTo] : [],
                        in_range: dateFrom && dateTo ? {
                          after: dateFrom,
                          before: dateTo
                        } : undefined,
                      }}
                      modifiersStyles={{
                        range_start: { backgroundColor: '#FF6A00', color: 'white', borderRadius: '50%' },
                        range_end: { backgroundColor: '#FF6A00', color: 'white', borderRadius: '50%' },
                        in_range: { backgroundColor: 'rgba(255, 106, 0, 0.1)' },
                      }}
                      initialFocus
                      className="p-2"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
              
            {/* Selection Actions */}
            {selectedVouchers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Badge variant="secondary" className="font-medium shrink-0">
                  {selectedVouchers.length} selected
                </Badge>
                <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={handlePrintSelected} className="h-8 px-2 sm:px-3">
                    <Printer className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRevokeSelected} className="h-8 px-2 sm:px-3">
                    <XCircle className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Revoke</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleResetValidity} className="h-8 px-2 sm:px-3">
                    <RefreshCw className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
                          <MoreHorizontal className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleMarkAsUsed}>
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Used
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleMarkAsExpired}>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as Expired
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  <Button 
                    size="sm" 
                    onClick={handleDeleteSelected} 
                    className="h-8 px-2 sm:px-3 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm"
                  >
                    <Trash2 className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 sm:w-12">
                      <Checkbox
                        checked={selectedVouchers.length === filteredVouchers.length && filteredVouchers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-[120px]">Code</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Start Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Expires</TableHead>
                    <TableHead className="w-10 sm:w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredVouchers.slice(0, 20).map((voucher) => {
                      const statusInfo = statusConfig[voucher.status];
                      const typeInfo = typeConfig[voucher.type];
                      const catInfo = categoryConfig[voucher.category];
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <motion.tr
                          key={voucher.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group"
                        >
                          <TableCell className="p-2 sm:p-4">
                            <Checkbox
                              checked={selectedVouchers.includes(voucher.id)}
                              onCheckedChange={(checked) => handleSelectVoucher(voucher.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="p-2 sm:p-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <code className="font-mono text-xs sm:text-sm bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[100px] sm:max-w-none">
                                {voucher.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                onClick={() => handleCopyCode(voucher.code)}
                              >
                                {copiedCode === voucher.code ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell p-2 sm:p-4">
                            <Badge variant="outline" className={cn(catInfo.color, "text-xs")}>
                              {catInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                            <Badge variant="outline" className={cn(typeInfo.color, "text-xs")}>
                              {typeInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm p-2 sm:p-4">{voucher.value}</TableCell>
                          <TableCell className="p-2 sm:p-4">
                            <Badge variant="outline" className={cn(statusInfo.color, "text-xs")}>
                              <StatusIcon className="h-3 w-3 mr-0.5 sm:mr-1" />
                              <span className="hidden sm:inline">{statusInfo.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-xs sm:text-sm p-2 sm:p-4">
                            {voucher.startDate.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-xs sm:text-sm p-2 sm:p-4">
                            {voucher.expiresAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="p-2 sm:p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleCopyCode(voucher.code)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Code
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <QrCode className="h-4 w-4 mr-2" />
                                  Show QR Code
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {voucher.status === 'active' && (
                                  <DropdownMenuItem onClick={() => handleRevokeVoucher(voucher.id)}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Revoke
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteVoucher(voucher.id)}
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
            
            {filteredVouchers.length > 20 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing 20 of {filteredVouchers.length} vouchers
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
