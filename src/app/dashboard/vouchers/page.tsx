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
  RefreshCw,
  Printer,
  QrCode,
  CalendarIcon,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import type { Package as PkgType } from '@/lib/api/types';
import { useUserStore } from '@/lib/store/user-store';
import { ApiError } from '@/lib/api/client';

// ─── Charset options ──────────────────────────────────────────────────────────
const CHARSET_OPTIONS = [
  {
    label: 'Alphanumeric (A-Z, a-z, 0-9)',
    value: 'alphanumeric',
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  },
  {
    label: 'Uppercase + Numbers (A-Z, 0-9)',
    value: 'upper_numeric',
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  },
  {
    label: 'Lowercase + Numbers (a-z, 0-9)',
    value: 'lower_numeric',
    charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
  },
  {
    label: 'Numbers Only (0-9)',
    value: 'numeric',
    charset: '0123456789',
  },
  {
    label: 'Uppercase Only (A-Z)',
    value: 'upper',
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  {
    label: 'Lowercase Only (a-z)',
    value: 'lower',
    charset: 'abcdefghijklmnopqrstuvwxyz',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
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

const categoryConfig: Record<VoucherCategory, { label: string; color: string; description: string }> = {
  hotspot:   { label: 'Hotspot',   color: 'bg-orange-500/10 text-orange-500',  description: 'WiFi hotspot access' },
  pppoe:     { label: 'PPPoE',     color: 'bg-blue-500/10 text-blue-500',      description: 'Point-to-Point Protocol' },
  prepaid:   { label: 'Prepaid',   color: 'bg-green-500/10 text-green-500',    description: 'Prepaid data packages' },
  corporate: { label: 'Corporate', color: 'bg-purple-500/10 text-purple-500',  description: 'Business accounts' },
  guest:     { label: 'Guest',     color: 'bg-gray-500/10 text-gray-500',      description: 'Temporary guest access' },
};

const statusConfig = {
  active:  { label: 'Active',  color: 'bg-green-500/10 text-green-500 border-green-500/20',   icon: CheckCircle2 },
  used:    { label: 'Used',    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',      icon: Check },
  expired: { label: 'Expired', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  revoked: { label: 'Revoked', color: 'bg-red-500/10 text-red-500 border-red-500/20',         icon: XCircle },
};

// ─── Timezone-aware date formatter ────────────────────────────────────────────
function formatLocalDate(date: Date | undefined, userTimezone?: string): string {
  if (!date || isNaN(date.getTime())) return '—';
  try {
    const tz = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Intl.DateTimeFormat('en-UG', {
      timeZone: tz,
      year:     'numeric',
      month:    'short',
      day:      'numeric',
      hour:     '2-digit',
      minute:   '2-digit',
      hour12:   true,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

// ─── Printable field options ────────────────────────────────────────────────
type VoucherCardField = 'code' | 'brand' | 'package' | 'duration' | 'price' | 'category' | 'created' | 'footer';

const VOUCHER_FIELD_OPTIONS: { key: VoucherCardField; label: string; required?: boolean }[] = [
  { key: 'code',     label: 'Voucher Code', required: true },
  { key: 'brand',    label: 'Brand / Business Name' },
  { key: 'package',  label: 'Package Name' },
  { key: 'duration', label: 'Duration' },
  { key: 'price',    label: 'Price' },
  { key: 'category', label: 'Category' },
  { key: 'created',  label: 'Created Date' },
  { key: 'footer',   label: 'Help / Footer Line' },
];

const DEFAULT_VOUCHER_FIELDS: VoucherCardField[] = ['code', 'brand', 'package', 'duration', 'price', 'footer'];

const MAX_VOUCHERS_PER_BATCH = 500;

// ─── Print helper ─────────────────────────────────────────────────────────────
function triggerVoucherCardPrint(
  selectedVoucherData: Voucher[],
  clientPackages: PkgType[],
  clientName: string,
  vouchersPerPage: number = 3,
  fields: VoucherCardField[] = DEFAULT_VOUCHER_FIELDS,
) {
  const show = (f: VoucherCardField) => fields.includes(f);
  const formatDuration = (seconds: number) => {
    const days  = seconds / 86400;
    const weeks = days / 7;
    const months = days / 30;
    if (months >= 1) return `${Math.round(months)} Month${Math.round(months) > 1 ? 's' : ''}`;
    if (weeks  >= 1) return `${Math.round(weeks)} Week${Math.round(weeks)   > 1 ? 's' : ''}`;
    if (days   >= 1) return `${Math.round(days)} Day${Math.round(days)      > 1 ? 's' : ''}`;
    const hours = seconds / 3600;
    if (hours  >= 1) return `${Math.round(hours)} Hour${Math.round(hours)   > 1 ? 's' : ''}`;
    const mins = seconds / 60;
    return `${Math.round(mins)} Min${Math.round(mins) > 1 ? 's' : ''}`;
  };

  const isDark = false;
  const brandOrange = '#FF6A00';
  const bgPrimary   = '#ffffff';
  const bgSecondary = '#f5f5f4';
  const textPrimary = '#111110';
  const textSecondary = '#6b6a67';
  const textMuted   = '#a09f9b';
  const borderColor = 'rgba(0,0,0,0.08)';
  const borderStrong = 'rgba(0,0,0,0.14)';
  const accentColor = '#1a6af5';

  const cardHTML = selectedVoucherData.map((voucher) => {
    const pkg      = clientPackages.find((p) => String(p.id) === String(voucher.batchId));
    const price    = pkg?.price ?? 0;
    const duration = pkg?.period ?? 0;
    const pkgName  = pkg?.title ?? voucher.packageTitle ?? 'Daily';
    const dur      = formatDuration(duration);
    const catLabel = categoryConfig[voucher.category]?.label ?? voucher.category;

    const detailBlocks = [
      show('package')  ? `<div class="detail-block"><div class="detail-label">PACKAGE</div><div class="detail-value">${pkgName}</div></div>` : '',
      show('duration') ? `<div class="detail-block"><div class="detail-label">DURATION</div><div class="detail-value">${dur}</div></div>` : '',
      show('price')    ? `<div class="detail-block"><div class="detail-label">PRICE</div><div class="detail-value price">UGX ${Number(price).toLocaleString()}</div></div>` : '',
      show('category') ? `<div class="detail-block"><div class="detail-label">CATEGORY</div><div class="detail-value">${catLabel}</div></div>` : '',
      show('created')  ? `<div class="detail-block"><div class="detail-label">CREATED</div><div class="detail-value">${formatLocalDate(voucher.createdAt)}</div></div>` : '',
    ].filter(Boolean).join('');

    return `
      <div class="voucher-card">
        <div class="card-stripe"></div>
        <div class="card-inner">
          ${show('brand') ? `
          <div class="card-top">
            <div class="brand-name">${clientName.toUpperCase()}</div>
          </div>` : ''}
          <div class="voucher-code-row">
            <svg class="wifi-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
            <span class="voucher-code">${voucher.code}</span>
          </div>
          ${detailBlocks ? `<div class="card-details">${detailBlocks}</div>` : ''}
          ${show('footer') ? `
          <div class="card-footer">
            <span>Help: +256770415425 &bull; +256704371231</span>
            <span class="footer-brand">XETIHUB</span>
          </div>` : ''}
        </div>
      </div>`;
  }).join('');

  const printHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Vouchers</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    background: ${bgPrimary};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-wrapper {
    padding: 0;
    background: ${bgPrimary};
  }
  .voucher-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 150px);
    gap: 2px;
    align-items: stretch;
    justify-content: center;
  }
  .voucher-card {
    border: 1px solid ${borderColor};
    border-radius: 0;
    overflow: hidden;
    background: ${bgSecondary};
    position: relative;
    break-inside: avoid;
    page-break-inside: avoid;
    -webkit-column-break-inside: avoid;
  }
  .card-stripe {
    height: 3px;
    background: ${brandOrange};
  }
  .card-inner {
    padding: 4px 6px 3px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .card-top, .voucher-code-row, .card-details, .card-footer {
    margin-bottom: 0;
  }
  .card-top {
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .brand-name {
    font-size: 6px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: ${brandOrange};
    text-align: center;
    text-transform: uppercase;
  }
  .voucher-code-row {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-bottom: 2px;
  }
  .wifi-icon {
    width: 10px;
    height: 10px;
    color: ${accentColor};
    flex-shrink: 0;
  }
  .voucher-code {
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: ${textPrimary};
    letter-spacing: 0;
    word-break: break-all;
  }
  .card-details {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
  }
  .detail-block {
    flex: 1;
    min-width: 40px;
    padding: 1px 3px;
    background: rgba(0,0,0,0.03);
    border-radius: 0;
  }
  .detail-label {
    font-size: 5px;
    font-weight: 600;
    color: ${textMuted};
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin-bottom: 0;
  }
  .detail-value {
    font-size: 7px;
    font-weight: 600;
    color: ${textPrimary};
  }
  .detail-value.price {
    font-size: 7px;
    font-weight: 700;
    color: ${brandOrange};
  }
  .card-footer {
    border-top: 1px solid ${borderColor};
    padding-top: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 5px;
    color: ${textMuted};
    gap: 2px;
  }
  .footer-brand {
    font-weight: 700;
    color: ${textSecondary};
    white-space: nowrap;
  }
  @page { margin: 0; }
  @media print {
    body { background: ${bgPrimary} !important; margin: 0; }
    .print-wrapper { padding: 0; }
    .voucher-card { box-shadow: none; }
  }
</style>
</head>
<body>
<div class="print-wrapper">
  <div class="voucher-grid">${cardHTML}</div>
</div>
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 300);
  };
<\/script>
</body>
</html>`;

  // Android-compatible: open a new window/tab with self-contained HTML
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
  } else {
    // Fallback for popups blocked: use blob URL
    const blob = new Blob([printHTML], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.target   = '_blank';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VouchersPage() {
  const [vouchers, setVouchers]             = useState<Voucher[]>([]);
  const [loading, setLoading]               = useState(true);
  const [clientPackages, setClientPackages] = useState<PkgType[]>([]);
  const { user }                            = useUserStore();

  // User timezone from preferences, falling back to browser
  const userTimezone = (user as any)?.preferences?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fetchVouchers = useCallback(async () => {
    const clientId = user?.client_id;
    if (!clientId) return;
    try {
      setLoading(true);
      const data = await vouchersService.getByClient(clientId);
      const mapped: Voucher[] = (Array.isArray(data) ? data : []).map((v: any) => ({
        id:           String(v.id),
        code:         String(v.code ?? ''),
        type:         'time' as const,
        category:     'hotspot' as VoucherCategory,
        value:        '',
        duration:     '',
        status:       (v.status as Voucher['status']) ?? 'active',
        createdAt:    new Date(String(v.createdAt ?? '')),
        usedAt:       v.usedAt ? new Date(String(v.usedAt)) : undefined,
        batchId:      String(v.package_id ?? ''),
        packageTitle: v.package?.title || 'Unknown Package',
      }));
      setVouchers(mapped);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  }, [user?.client_id]);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState('');
  const [statusFilter,   setStatusFilter]   = useState<string>('all');
  const [packageFilter,  setPackageFilter]  = useState<string>('all');
  const [dateFrom,       setDateFrom]       = useState<Date | undefined>(undefined);
  const [dateTo,         setDateTo]         = useState<Date | undefined>(undefined);
  const [datePickerStep, setDatePickerStep] = useState<'start' | 'end'>('start');
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [deletingVouchers, setDeletingVouchers] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode]         = useState<string | null>(null);

  // ── Print options state ────────────────────────────────────────────────────
  const [printDialogOpen,   setPrintDialogOpen]   = useState(false);
  const [vouchersPerPage,   setVouchersPerPage]   = useState<number>(3);
  const [selectedFields, setSelectedFields] = useState<VoucherCardField[]>(DEFAULT_VOUCHER_FIELDS);

  const toggleField = (field: VoucherCardField) => {
    if (field === 'code') return; // mandatory, can't be toggled
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]);
  };

  // ── New voucher form state ─────────────────────────────────────────────────
  const [newVoucher, setNewVoucher] = useState({
    category:   'hotspot' as VoucherCategory,
    quantity:   10,
    length:     8,
    prefix:     'NET',
    packageId:  '',
    charsetKey: 'lower_numeric',
  });

  useEffect(() => {
    const load = async () => {
      const clientId = user?.client_id;
      if (!clientId) return;
      try {
        const data = await packagesService.getByClient(clientId);
        setClientPackages(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load client packages');
      }
    };
    load();
  }, [user?.client_id]);

  useEffect(() => {
    if (!newVoucher.packageId && clientPackages.length > 0) {
      setNewVoucher((prev) => ({ ...prev, packageId: String(clientPackages[0].id) }));
    }
  }, [clientPackages, newVoucher.packageId]);

  // ── Filtered vouchers ──────────────────────────────────────────────────────
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchesSearch   = v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.batchId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus   = statusFilter  === 'all' || v.status  === statusFilter;
      const matchesPackage  = packageFilter === 'all' || v.batchId === packageFilter;
      const vDate           = new Date(v.createdAt);
      const matchesFrom     = !dateFrom || vDate >= dateFrom;
      const matchesTo       = !dateTo   || vDate <= new Date(dateTo.getTime() + 86_399_999);
      return matchesSearch && matchesStatus && matchesPackage && matchesFrom && matchesTo;
    });
  }, [vouchers, searchQuery, statusFilter, packageFilter, dateFrom, dateTo]);

  const clearDateFilter = () => { setDateFrom(undefined); setDateTo(undefined); setDatePickerStep('start'); };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (datePickerStep === 'start') {
      setDateFrom(date); setDateTo(undefined); setDatePickerStep('end');
    } else {
      if (dateFrom && date < dateFrom) { setDateTo(dateFrom); setDateFrom(date); }
      else setDateTo(date);
      setDatePickerStep('start');
    }
  };

  const stats = useMemo(() => ({
    total:   vouchers.length,
    active:  vouchers.filter((v) => v.status === 'active').length,
    used:    vouchers.filter((v) => v.status === 'used').length,
    expired: vouchers.filter((v) => v.status === 'expired').length,
  }), [vouchers]);

  // ── Pagination state ───────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, packageFilter, dateFrom, dateTo]);

  const paginatedVouchers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVouchers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVouchers, currentPage]);

  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Voucher code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectAll = (checked: boolean) =>
    setSelectedVouchers(checked ? filteredVouchers.map((v) => v.id) : []);

  const handleExportPrintableCards = () => {
    if (selectedVouchers.length === 0) { toast.error('Please select vouchers to export'); return; }
    setPrintDialogOpen(true);
  };

  const handleConfirmPrint = () => {
    const data = filteredVouchers.filter((v) => selectedVouchers.includes(v.id));
    const clientName = user?.client?.businessName ?? (user as any)?.name ?? 'Network';
    triggerVoucherCardPrint(data, clientPackages, clientName, vouchersPerPage, selectedFields);
    setPrintDialogOpen(false);
  };

  const handleCreateVouchers = async (printAfter: boolean = false) => {
    const clientId = user?.client_id;
    if (!clientId) { toast.error('No client ID'); return; }
    if (!newVoucher.packageId) { toast.error('Please select a package before generating vouchers'); return; }
    if (newVoucher.quantity > MAX_VOUCHERS_PER_BATCH) {
      toast.error(`You can generate a maximum of ${MAX_VOUCHERS_PER_BATCH} vouchers at a time`);
      return;
    }

    const selectedCharset = CHARSET_OPTIONS.find((o) => o.value === newVoucher.charsetKey)?.charset
      ?? CHARSET_OPTIONS[0].charset;

    try {
      const data = await vouchersService.create({
        length:     newVoucher.length,
        count:      newVoucher.quantity,
        prefix:     newVoucher.prefix,
        package_id: newVoucher.packageId,
        client_id:  clientId,
        charset:    selectedCharset,
      });
      
      const createdVouchers = Array.isArray(data) ? data : [];
      const mappedVouchers: Voucher[] = createdVouchers.map((v: any) => ({
        id:           String(v.id),
        code:         String(v.code ?? ''),
        type:         'time' as const,
        category:     newVoucher.category,
        value:        '',
        duration:     '',
        status:       (v.status as Voucher['status']) ?? 'active',
        createdAt:    new Date(String(v.createdAt ?? '')),
        usedAt:       v.usedAt ? new Date(String(v.usedAt)) : undefined,
        batchId:      String(v.package_id ?? ''),
        packageTitle: v.package?.title || 'Unknown Package',
      }));

      setCreateDialogOpen(false);
      toast.success(`${newVoucher.quantity} vouchers created successfully`);
      fetchVouchers();
      
      if (printAfter && mappedVouchers.length > 0) {
        const clientName = user?.client?.businessName ?? (user as any)?.name ?? 'Network';
        setTimeout(() => triggerVoucherCardPrint(mappedVouchers, clientPackages, clientName, vouchersPerPage, selectedFields), 500);
      }
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
      selectedVouchers.includes(v.id) ? { ...v, status: 'used' as const, usedAt: new Date() } : v));
    toast.success(`${selectedVouchers.length} vouchers marked as used`);
    setSelectedVouchers([]);
  };

  const handleMarkAsExpired = () => {
    setVouchers(vouchers.map((v) =>
      selectedVouchers.includes(v.id) ? { ...v, status: 'expired' as const } : v));
    toast.success(`${selectedVouchers.length} vouchers marked as expired`);
    setSelectedVouchers([]);
  };

  const handleResetValidity = () => {
    setVouchers(vouchers.map((v) =>
      selectedVouchers.includes(v.id)
        ? { ...v, status: 'active' as const, usedAt: undefined, usedBy: undefined }
        : v));
    toast.success(`${selectedVouchers.length} vouchers reset`);
    setSelectedVouchers([]);
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
    setDeletingVouchers((prev) => new Set(prev).add(id));
    try {
      await vouchersService.delete(id);
      toast.success('Voucher deleted');
      fetchVouchers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete voucher');
    } finally {
      setDeletingVouchers((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handleSelectVoucher = (id: string, checked: boolean) =>
    setSelectedVouchers((prev) => checked ? [...prev, id] : prev.filter((v) => v !== id));

  // ── Selected charset preview chars ────────────────────────────────────────
  const previewCharset = CHARSET_OPTIONS.find((o) => o.value === newVoucher.charsetKey)?.charset ?? '';
  const previewCode = newVoucher.prefix
    ? `${newVoucher.prefix}-${'X'.repeat(Math.max(newVoucher.length - newVoucher.prefix.length - 1, 4))}`
    : 'X'.repeat(newVoucher.length);

  // ─────────────────────────────────────────────────────────────────────────
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
            {/* ── Create Dialog ─────────────────────────────────────────── */}
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

                <div className="grid gap-4 py-3 sm:py-4">

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-sm">Voucher Category</Label>
                    <Select
                      value={newVoucher.category}
                      onValueChange={(v: VoucherCategory) => setNewVoucher({ ...newVoucher, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>
                            <span>{cfg.label}</span>
                            <span className="text-xs text-muted-foreground ml-1">— {cfg.description}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Package */}
                  <div className="space-y-2">
                    <Label className="text-sm">Package</Label>
                    <Select
                      value={newVoucher.packageId}
                      onValueChange={(v) => setNewVoucher({ ...newVoucher, packageId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={clientPackages.length ? 'Select package' : 'No package available'} />
                      </SelectTrigger>
                      <SelectContent>
                        {clientPackages.length > 0 ? (
                          clientPackages.map((pkg) => (
                            <SelectItem key={pkg.id} value={String(pkg.id)}>
                              {pkg.title} — {Math.round(pkg.period / 86400)}d •{' '}
                              {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(pkg.price)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No packages found for your client</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Count + Length */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Count <span className="text-muted-foreground font-normal">(max {MAX_VOUCHERS_PER_BATCH})</span></Label>
                      <Input
                        type="number"
                        min={1}
                        max={MAX_VOUCHERS_PER_BATCH}
                        value={newVoucher.quantity}
                        onChange={(e) => setNewVoucher({ ...newVoucher, quantity: Math.min(MAX_VOUCHERS_PER_BATCH, Math.max(1, parseInt(e.target.value) || 1)) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Code Length <span className="text-muted-foreground font-normal">(chars)</span></Label>
                      <Input
                        type="number"
                        min={4}
                        max={32}
                        value={newVoucher.length}
                        onChange={(e) => setNewVoucher({ ...newVoucher, length: Math.min(32, Math.max(4, parseInt(e.target.value) || 8)) })}
                      />
                    </div>
                  </div>

                  {/* Prefix */}
                  <div className="space-y-2">
                    <Label className="text-sm">Code Prefix <span className="text-muted-foreground font-normal">(optional, max 6 chars)</span></Label>
                    <Input
                      value={newVoucher.prefix}
                      onChange={(e) => setNewVoucher({ ...newVoucher, prefix: e.target.value.toUpperCase().slice(0, 6) })}
                      placeholder="NET"
                      maxLength={6}
                    />
                  </div>

                  {/* Character Set */}
                  <div className="space-y-2">
                    <Label className="text-sm">Character Set</Label>
                    <Select
                      value={newVoucher.charsetKey}
                      onValueChange={(v) => setNewVoucher({ ...newVoucher, charsetKey: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHARSET_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground font-mono truncate px-1">
                      {previewCharset.slice(0, 60)}{previewCharset.length > 60 ? '…' : ''}
                    </p>
                  </div>

                  {/* Card fields to print */}
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Fields to Show on Voucher Card
                    </Label>
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border bg-muted/30">
                      {VOUCHER_FIELD_OPTIONS.map((opt) => (
                        <div key={opt.key} className="flex items-center gap-2">
                          <Checkbox
                            id={`field-${opt.key}`}
                            checked={selectedFields.includes(opt.key)}
                            disabled={opt.required}
                            onCheckedChange={() => toggleField(opt.key)}
                          />
                          <Label
                            htmlFor={`field-${opt.key}`}
                            className={cn('text-sm font-normal cursor-pointer', opt.required && 'text-muted-foreground')}
                          >
                            {opt.label}{opt.required && ' (required)'}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vouchers per page (for printing) */}
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Vouchers per Page <span className="text-muted-foreground font-normal">(for printing)</span>
                    </Label>
                    <Select
                      value={String(vouchersPerPage)}
                      onValueChange={(v) => setVouchersPerPage(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 per page</SelectItem>
                        <SelectItem value="2">2 per page</SelectItem>
                        <SelectItem value="3">3 per page (default)</SelectItem>
                        <SelectItem value="4">4 per page</SelectItem>
                        <SelectItem value="6">6 per page (small cards)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Controls how many cards print per row on paper
                    </p>
                  </div>

                  {/* Preview card */}
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm font-medium mb-3">Voucher Preview</p>
                    <div className="flex flex-wrap gap-2 text-xs mb-3">
                      <Badge className={categoryConfig[newVoucher.category].color}>
                        {categoryConfig[newVoucher.category].label}
                      </Badge>
                      {newVoucher.packageId && clientPackages.find((p) => String(p.id) === newVoucher.packageId) && (
                        <Badge variant="outline">
                          {clientPackages.find((p) => String(p.id) === newVoucher.packageId)?.title}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Example Code</p>
                        <code className="font-mono text-sm font-semibold text-primary">{previewCode}</code>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>Length: {newVoucher.length} chars</p>
                        <p>Count: {newVoucher.quantity}</p>
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
                    onClick={() => handleCreateVouchers(true)}
                    className="gap-2 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white font-semibold shadow-lg shadow-[#FF6A00]/25 ring-2 ring-[#FF6A00]/20 focus:ring-4 focus:ring-[#FF6A00]/40 transition-all"
                  >
                    <Printer className="h-4 w-4" />
                    Generate &amp; Print
                  </Button>
                  {/* <Button
                    onClick={() => handleCreateVouchers(false)}
                    className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white font-semibold shadow-lg shadow-[#FF6A00]/25 ring-2 ring-[#FF6A00]/20 focus:ring-4 focus:ring-[#FF6A00]/40 transition-all"
                  >
                    Generate {newVoucher.quantity} Vouchers
                  </Button> */}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Vouchers', value: stats.total,   color: 'text-primary' },
            { label: 'Active',         value: stats.active,  color: 'text-green-500' },
            { label: 'Used',           value: stats.used,    color: 'text-blue-500' },
            { label: 'Expired',        value: stats.expired, color: 'text-yellow-500' },
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

              {/* Filter row */}
              <div className="flex flex-wrap gap-2">
                {/* Status filter */}
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

                {/* Package filter (replaces "All Types") */}
                <Select value={packageFilter} onValueChange={setPackageFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="All Packages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Packages</SelectItem>
                    {clientPackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={String(pkg.id)}>
                        {pkg.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date range */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full sm:w-auto justify-start text-left font-normal h-10',
                        (dateFrom || dateTo) && 'bg-[#FF6A00]/10 border-[#FF6A00]/50 text-[#FF6A00]',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? (
                        dateTo
                          ? <span className="text-sm">{format(dateFrom, 'MMM d')} – {format(dateTo, 'MMM d')}</span>
                          : <span className="text-sm">{format(dateFrom, 'MMM d')} – …</span>
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
                          <p className="text-xs text-[#FF6A00] mt-0.5">
                            {datePickerStep === 'start' ? 'Click to set start date' : 'Click to set end date'}
                          </p>
                        </div>
                        {(dateFrom || dateTo) && (
                          <Button variant="ghost" size="sm" onClick={clearDateFilter} className="h-7 text-xs text-muted-foreground">
                            Clear
                          </Button>
                        )}
                      </div>
                      {(dateFrom || dateTo) && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Badge variant="outline" className="font-mono">
                            {dateFrom ? format(dateFrom, 'MMM d, yyyy') : '—'}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="outline" className="font-mono">
                            {dateTo ? format(dateTo, 'MMM d, yyyy') : '—'}
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
                        range_end:   dateTo   ? [dateTo]   : [],
                        in_range:    dateFrom && dateTo ? { after: dateFrom, before: dateTo } : undefined,
                      }}
                      modifiersStyles={{
                        range_start: { backgroundColor: '#FF6A00', color: 'white', borderRadius: '50%' },
                        range_end:   { backgroundColor: '#FF6A00', color: 'white', borderRadius: '50%' },
                        in_range:    { backgroundColor: 'rgba(255,106,0,0.1)' },
                      }}
                      initialFocus
                      className="p-2"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Selection actions */}
            {selectedVouchers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Badge variant="secondary" className="font-medium shrink-0">
                  {selectedVouchers.length} selected
                </Badge>
                <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={handleExportPrintableCards} className="h-8 px-2 sm:px-3">
                    <Printer className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Print Cards</span>
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
                        <Check className="h-4 w-4 mr-2" /> Mark as Used
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleMarkAsExpired}>
                        <Clock className="h-4 w-4 mr-2" /> Mark as Expired
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" onClick={handleDeleteSelected} className="h-8 px-2 sm:px-3 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm">
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
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="hidden lg:table-cell">Used</TableHead>
                    <TableHead className="w-10 sm:w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {paginatedVouchers.map((voucher) => {
                      const statusInfo = statusConfig[voucher.status];
                      const catInfo    = categoryConfig[voucher.category];
                      const StatusIcon = statusInfo.icon;

                      const isDeleting = deletingVouchers.has(voucher.id);
                      return (
                        <motion.tr
                          key={voucher.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isDeleting ? 0.5 : 1 }}
                          exit={{ opacity: 0 }}
                          className={cn("group relative", isDeleting && "pointer-events-none select-none")}
                        >
                          {isDeleting && (
                            <td colSpan={8} className="absolute inset-0 z-10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase bg-background/80 px-3 py-1">
                                Deleting Voucher…
                              </span>
                            </td>
                          )}
                          <TableCell className={cn("p-2 sm:p-4", isDeleting && "opacity-30")}>
                            <Checkbox
                              checked={selectedVouchers.includes(voucher.id)}
                              onCheckedChange={(checked) => handleSelectVoucher(voucher.id, checked as boolean)}
                              disabled={isDeleting}
                            />
                          </TableCell>
                          <TableCell className={cn("p-2 sm:p-4", isDeleting && "opacity-30")}>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <code className="font-mono text-xs sm:text-sm bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[100px] sm:max-w-none">
                                {voucher.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isDeleting}
                                className="h-6 w-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                onClick={() => handleCopyCode(voucher.code)}
                              >
                                {copiedCode === voucher.code
                                  ? <Check className="h-3 w-3 text-green-500" />
                                  : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className={cn("hidden md:table-cell p-2 sm:p-4", isDeleting && "opacity-30")}>
                            <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                              {voucher.packageTitle}
                            </span>
                          </TableCell>
                          <TableCell className={cn("hidden md:table-cell p-2 sm:p-4", isDeleting && "opacity-30")}>
                            <Badge variant="outline" className={cn(catInfo.color, 'text-xs')}>
                              {catInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn("p-2 sm:p-4", isDeleting && "opacity-30")}>
                            <Badge variant="outline" className={cn(statusInfo.color, 'text-xs')}>
                              <StatusIcon className="h-3 w-3 mr-0.5 sm:mr-1" />
                              <span className="hidden sm:inline">{statusInfo.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className={cn("hidden lg:table-cell text-muted-foreground text-xs sm:text-sm p-2 sm:p-4", isDeleting && "opacity-30")}>
                            <span title={formatLocalDate(voucher.createdAt, userTimezone)}>
                              {formatLocalDate(voucher.createdAt, userTimezone)}
                            </span>
                          </TableCell>
                          <TableCell className={cn("hidden lg:table-cell text-muted-foreground text-xs sm:text-sm p-2 sm:p-4", isDeleting && "opacity-30")}>
                            {voucher.usedAt
                              ? <span title={formatLocalDate(voucher.usedAt, userTimezone)}>{formatLocalDate(voucher.usedAt, userTimezone)}</span>
                              : '—'}
                          </TableCell>
                          <TableCell className={cn("p-2 sm:p-4", isDeleting && "opacity-30")}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={isDeleting} className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleCopyCode(voucher.code)}>
                                  <Copy className="h-4 w-4 mr-2" /> Copy Code
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <QrCode className="h-4 w-4 mr-2" /> Show QR Code
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {voucher.status === 'active' && (
                                  <DropdownMenuItem onClick={() => handleRevokeVoucher(voucher.id)}>
                                    <XCircle className="h-4 w-4 mr-2" /> Revoke
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteVoucher(voucher.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm text-muted-foreground hidden sm:block">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVouchers.length)} of {filteredVouchers.length} vouchers
                </div>
                <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm font-medium px-2">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {totalPages <= 1 && filteredVouchers.length > 0 && (
              <div className="mt-4 text-center text-sm text-muted-foreground pb-4">
                Showing all {filteredVouchers.length} vouchers
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Print Options Dialog ─────────────────────────────────────── */}
        <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Print Voucher Cards
              </DialogTitle>
              <DialogDescription>
                Configure print layout for {selectedVouchers.length} selected voucher{selectedVouchers.length !== 1 ? 's' : ''}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Fields to Show on Card</Label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border bg-muted/30">
                  {VOUCHER_FIELD_OPTIONS.map((opt) => (
                    <div key={opt.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`print-field-${opt.key}`}
                        checked={selectedFields.includes(opt.key)}
                        disabled={opt.required}
                        onCheckedChange={() => toggleField(opt.key)}
                      />
                      <Label
                        htmlFor={`print-field-${opt.key}`}
                        className={cn('text-sm font-normal cursor-pointer', opt.required && 'text-muted-foreground')}
                      >
                        {opt.label}{opt.required && ' (required)'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Vouchers per Row</Label>
                <Select
                  value={String(vouchersPerPage)}
                  onValueChange={(v) => setVouchersPerPage(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 per row — large cards</SelectItem>
                    <SelectItem value="2">2 per row</SelectItem>
                    <SelectItem value="3">3 per row (default)</SelectItem>
                    <SelectItem value="4">4 per row — compact</SelectItem>
                    <SelectItem value="6">6 per row — mini cards</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tip: On Android, the print dialog may open in your browser. Choose "Save as PDF" first if needed.
                </p>
              </div>
              {/* Visual grid preview */}
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Layout Preview</p>
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${Math.min(vouchersPerPage, 4)}, 1fr)` }}
                >
                  {Array.from({ length: Math.min(vouchersPerPage * 2, 8) }).map((_, i) => (
                    <div key={i} className="h-8 rounded bg-muted border border-border/60 flex items-center justify-center">
                      <div className="w-2/3 h-1.5 rounded-full bg-muted-foreground/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleConfirmPrint}
                className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white font-semibold"
              >
                <Printer className="h-4 w-4 mr-2" />
                Open Print View
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PageTransition>
  );
}
