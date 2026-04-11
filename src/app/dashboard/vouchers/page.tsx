'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { packagesService, vouchersService } from '@/lib/api/services/base-operations';
import type { Package } from '@/lib/api/types';
import { useUserStore } from '@/lib/store/user-store';
import { ApiError } from '@/lib/api/client';

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
  usedAt?: Date;
  usedBy?: string;
  batchId?: string;
  packageTitle?: string;
}

// Category configuration
const categoryConfig: Record<VoucherCategory, { label: string; color: string; description: string }> = {
  hotspot: { label: 'Hotspot', color: 'bg-orange-500/10 text-orange-500', description: 'WiFi hotspot access' },
  pppoe: { label: 'PPPoE', color: 'bg-blue-500/10 text-blue-500', description: 'Point-to-Point Protocol' },
  prepaid: { label: 'Prepaid', color: 'bg-green-500/10 text-green-500', description: 'Prepaid data packages' },
  corporate: { label: 'Corporate', color: 'bg-purple-500/10 text-purple-500', description: 'Business accounts' },
  guest: { label: 'Guest', color: 'bg-gray-500/10 text-gray-500', description: 'Temporary guest access' },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  used: { label: 'Used', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Check },
  expired: { label: 'Expired', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  revoked: { label: 'Revoked', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientPackages, setClientPackages] = useState<Package[]>([]);
  const { user } = useUserStore();

  const fetchVouchers = useCallback(async () => {
    const clientId = user?.client_id;
    if (!clientId) return;
    try {
      setLoading(true);
      const data = await vouchersService.getByClient(clientId);
      const mapped: Voucher[] = (Array.isArray(data) ? data : []).map((v: any) => {
        const packageInfo = clientPackages.find(pkg => String(pkg.id) === String(v.package_id));
        return {
          id: String(v.id),
          code: String(v.code ?? ''),
          type: 'time' as const,
          category: 'hotspot' as VoucherCategory,
          value: '',
          duration: '',
          status: (v.status as Voucher['status']) ?? 'active',
          createdAt: new Date(String(v.createdAt ?? '')),
          usedAt: v.usedAt ? new Date(String(v.usedAt)) : undefined,
          batchId: String(v.package_id ?? ''),
          packageTitle: v.package.title || 'Unknown Package',
        };
      });
      setVouchers(mapped);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  }, [user?.client_id]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);
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
    category: 'hotspot' as VoucherCategory,
    quantity: 10,
    prefix: 'NET',
    packageId: '',
  });

  useEffect(() => {
    const loadClientPackages = async () => {
      const clientId = user?.client_id;
      if (!clientId) return;

      try {
        const data = await packagesService.getByClient(clientId);
        const packages = Array.isArray(data) ? data : [];
        setClientPackages(packages);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load client packages');
      }
    };

    loadClientPackages();
  }, [user?.client_id]);

  useEffect(() => {
    if (!newVoucher.packageId && clientPackages.length > 0) {
      setNewVoucher((prev) => ({ ...prev, packageId: String(clientPackages[0].id) }));
    }
  }, [clientPackages, newVoucher.packageId]);

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

  const handleExportPrintableCards = () => {
    if (selectedVouchers.length === 0) {
      toast.error('Please select vouchers to export');
      return;
    }

    const selectedVoucherData = filteredVouchers.filter(v => selectedVouchers.includes(v.id));

    // Function to format duration from seconds to human readable
    const formatDuration = (seconds: number) => {
      const minutes = seconds / 60;
      const hours = minutes / 60;
      const days = hours / 24;
      const weeks = days / 7;
      const months = days / 30;

      if (months >= 1) return `${Math.round(months)} month${Math.round(months) > 1 ? 's' : ''}`;
      if (weeks >= 1) return `${Math.round(weeks)} week${Math.round(weeks) > 1 ? 's' : ''}`;
      if (days >= 1) return `${Math.round(days)} day${Math.round(days) > 1 ? 's' : ''}`;
      if (hours >= 1) return `${Math.round(hours)} hour${Math.round(hours) > 1 ? 's' : ''}`;
      return `${Math.round(minutes)} minute${Math.round(minutes) > 1 ? 's' : ''}`;
    };

    // Create a hidden print container
    const printContainer = document.createElement('div');
    printContainer.id = 'voucher-print-container';
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '-9999px';
    printContainer.innerHTML = `
      <style>
        @media print {
          body * { visibility: hidden; }
          #voucher-print-container,
          #voucher-print-container * { visibility: visible; }
          #voucher-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
          }
        }

        .print-page {
          page-break-after: always;
          padding: 0.5in;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .print-page:last-child {
          page-break-after: avoid;
        }

        .voucher-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.25in;
          margin: 0.25in 0;
        }

        .voucher-card {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          background: white;
          position: relative;
          break-inside: avoid;
          height: 2.5in;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .voucher-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #FF6A00, #ff8533);
        }

        .voucher-header {
          margin-bottom: 12px;
        }

        .package-title {
          font-size: 12px;
          font-weight: bold;
          color: #374151;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .voucher-code {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          background: #f3f4f6;
          padding: 8px 12px;
          border-radius: 6px;
          text-align: center;
          letter-spacing: 1px;
          margin: 8px 0;
          border: 1px solid #e5e7eb;
        }

        .voucher-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #6b7280;
          margin: 4px 0;
        }

        .price-duration {
          background: #f8fafc;
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          font-weight: 500;
        }

        .voucher-footer {
          font-size: 8px;
          color: #9ca3af;
          text-align: center;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #f3f4f6;
        }

        .company-header {
          text-align: center;
          margin-bottom: 0.25in;
          padding-bottom: 0.1in;
          border-bottom: 2px solid #FF6A00;
        }

        .company-name {
          font-size: 16px;
          font-weight: bold;
          color: #FF6A00;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>

      <div class="print-page">
        <div class="company-header">
          <h1 class="company-name">ZOTA Network</h1>
        </div>

        <div class="voucher-grid">
          ${selectedVoucherData.map(voucher => {
            const packageInfo = clientPackages.find(pkg => String(pkg.id) === String(voucher.batchId));
            const price = packageInfo?.price || 0;
            const duration = packageInfo?.period || 0;
            const formattedDuration = formatDuration(duration);

            return `
              <div class="voucher-card">
                <div class="voucher-header">
                  <h3 class="package-title">${voucher.packageTitle}</h3>
                </div>
                <div class="voucher-code">${voucher.code}</div>
                <div class="voucher-details">
                  <div class="price-duration">
                    UGX ${price.toLocaleString()} • ${formattedDuration}
                  </div>
                </div>
                <div class="voucher-footer">
                  Created: ${format(voucher.createdAt, 'MMM dd, yyyy')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Add to document body
    document.body.appendChild(printContainer);

    // Trigger print
    window.print();

    // Clean up after printing
    setTimeout(() => {
      document.body.removeChild(printContainer);
    }, 1000);
  };

  const handleCreateVouchers = async () => {
    const clientId = user?.client_id;
    if (!clientId) {
      toast.error('No client ID');
      return;
    }

    if (!newVoucher.packageId) {
      toast.error('Please select a package before generating vouchers');
      return;
    }

    try {
      await vouchersService.create({
        length: 8,
        count: newVoucher.quantity,
        prefix: newVoucher.prefix,
        package_id: newVoucher.packageId,
        client_id: clientId,
      });
      setCreateDialogOpen(false);
      toast.success(`${newVoucher.quantity} vouchers created successfully`);
      fetchVouchers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create vouchers');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedVouchers.map((id) => vouchersService.delete(id)));
      toast.success(`${selectedVouchers.length} vouchers deleted`);
      setSelectedVouchers([]);
      fetchVouchers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete vouchers');
    }
  };

  const handleRevokeSelected = async () => {
    try {
      await Promise.all(selectedVouchers.map((id) => vouchersService.updateStatus(id, 'revoked')));
      toast.success(`${selectedVouchers.length} vouchers revoked`);
      setSelectedVouchers([]);
      fetchVouchers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to revoke vouchers');
    }
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

  const handleRevokeVoucher = async (id: string) => {
    try {
      await vouchersService.updateStatus(id, 'revoked');
      toast.success('Voucher revoked');
      fetchVouchers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to revoke voucher');
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    try {
      await vouchersService.delete(id);
      toast.success('Voucher deleted');
      fetchVouchers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete voucher');
    }
  };

  const handleSelectVoucher = (id: string, checked: boolean) => {
    setSelectedVouchers(prev => 
      checked 
        ? [...prev, id] 
        : prev.filter(voucherId => voucherId !== id)
    );
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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 sm:h-9"
              onClick={handleExportPrintableCards}
              disabled={selectedVouchers.length === 0}
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export Cards</span>
              <span className="sm:hidden">Cards</span>
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

                  <div className="space-y-2">
                    <Label className="text-sm">Package</Label>
                    <Select
                      value={newVoucher.packageId}
                      onValueChange={(value) => setNewVoucher({ ...newVoucher, packageId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={clientPackages.length ? 'Select package' : 'No package available'} />
                      </SelectTrigger>
                      <SelectContent>
                        {clientPackages.length > 0 ? (
                          clientPackages.map((pkg) => (
                            <SelectItem key={pkg.id} value={String(pkg.id)}>
                              {pkg.title} - {Math.round(pkg.period / 86400)}d • {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(pkg.price)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No packages found for your client
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
                      {newVoucher.packageId && clientPackages.find(pkg => String(pkg.id) === newVoucher.packageId) && (
                        <Badge variant="outline">
                          {clientPackages.find(pkg => String(pkg.id) === newVoucher.packageId)?.title}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Example Code</p>
                        <code className="font-mono text-sm font-semibold text-primary">
                          {newVoucher.prefix}-XXXX-XXXX
                        </code>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Package</p>
                        <span className="text-sm font-medium">
                          {newVoucher.packageId && clientPackages.find(pkg => String(pkg.id) === newVoucher.packageId)
                            ? `${clientPackages.find(pkg => String(pkg.id) === newVoucher.packageId)?.title} (${Math.round((clientPackages.find(pkg => String(pkg.id) === newVoucher.packageId)?.period || 0) / 86400)}d)`
                            : 'Select package'
                          }
                        </span>
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
                    <TableHead className="hidden md:table-cell">Package</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Created Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Used Date</TableHead>
                    <TableHead className="w-10 sm:w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredVouchers.slice(0, 20).map((voucher) => {
                      const statusInfo = statusConfig[voucher.status];
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
                            <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                              {voucher.packageTitle}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell p-2 sm:p-4">
                            <Badge variant="outline" className={cn(catInfo.color, "text-xs")}>
                              {catInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-2 sm:p-4">
                            <Badge variant="outline" className={cn(statusInfo.color, "text-xs")}>
                              <StatusIcon className="h-3 w-3 mr-0.5 sm:mr-1" />
                              <span className="hidden sm:inline">{statusInfo.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-xs sm:text-sm p-2 sm:p-4">
                            {voucher.createdAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-xs sm:text-sm p-2 sm:p-4">
                            {voucher.usedAt ? voucher.usedAt.toLocaleDateString() : '--'}
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
