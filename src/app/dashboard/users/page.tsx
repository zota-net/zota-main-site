'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  Search,
  Download,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { bopDevicesService } from '@/lib/api/services/base-operations';
import { useUserStore } from '@/lib/store/user-store';
import { ApiError } from '@/lib/api/client';
import type { BopDevice } from '@/lib/api/types';

// Connected User types
interface ConnectedUser {
  id: string;
  macAddress: string;
  voucherId: string;
  expiresAt: Date;
  createdAt: Date;
  status: 'active' | 'expired';
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  expired: { label: 'Expired', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export default function ConnectedUsersPage() {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<ConnectedUser | null>(null);
  const currentUser = useUserStore((s) => s.user);

  const fetchConnectedUsers = useCallback(async () => {
    if (!currentUser?.client_id) return;
    try {
      setIsLoading(true);
      const devices = await bopDevicesService.getByClient(currentUser.client_id);
      console.log('Fetched devices:', devices);
      const mapped: ConnectedUser[] = (Array.isArray(devices) ? devices : []).map((d: BopDevice) => {
        const expiresAt = d.expiresAt ? new Date(d.expiresAt) : new Date();
        const isExpired = expiresAt < new Date();
        return {
          id: d.id,
          macAddress: d.macAddress,
          voucherId: d.voucher_id,
          expiresAt,
          createdAt: new Date(d.createdAt),
          status: isExpired ? 'expired' : 'active',
        };
      });
      setConnectedUsers(mapped);
    } catch (err) {
      console.error('Failed to fetch connected users:', err);
      toast.error(err instanceof ApiError ? err.message : 'Failed to load connected users');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.client_id]);

  useEffect(() => {
    fetchConnectedUsers();
  }, [fetchConnectedUsers]);

  // Filter devices
  const filteredDevices = useMemo(() => {
    return connectedUsers.filter((d) => {
      const matchesSearch =
        d.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.voucherId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [connectedUsers, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(
    () => ({
      total: connectedUsers.length,
      active: connectedUsers.filter((d) => d.status === 'active').length,
      expired: connectedUsers.filter((d) => d.status === 'expired').length,
    }),
    [connectedUsers]
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDevices(filteredDevices.map((d) => d.id));
    } else {
      setSelectedDevices([]);
    }
  };

  const handleSelectDevice = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices([...selectedDevices, id]);
    } else {
      setSelectedDevices(selectedDevices.filter((d) => d !== id));
    }
  };

  const handleDeleteDevice = async () => {
    if (!selectedDevice) return;
    
    try {
      // Device deletion would be handled by the API if needed
      // For now, just remove from local state
      setConnectedUsers(connectedUsers.filter((d) => d.id !== selectedDevice.id));
      setDeleteDialogOpen(false);
      setSelectedDevice(null);
      toast.success('Device removed');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete device');
    }
  };

  const handleDeleteSelected = () => {
    setConnectedUsers(connectedUsers.filter((d) => !selectedDevices.includes(d.id)));
    toast.success(`${selectedDevices.length} devices removed`);
    setSelectedDevices([]);
  };

  const openDeleteDialog = (device: ConnectedUser) => {
    setSelectedDevice(device);
    setDeleteDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Wifi className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Connected Users
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View devices connected to your network via vouchers
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 sm:h-9">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Devices', value: stats.total, color: 'text-primary', icon: Wifi },
            { label: 'Active', value: stats.active, color: 'text-green-500', icon: CheckCircle },
            { label: 'Expired', value: stats.expired, color: 'text-red-500', icon: XCircle },
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

        {/* Devices Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by MAC or voucher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[250px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedDevices.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedDevices.length} selected
                    </span>
                    <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading connected devices...</p>
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedDevices.length === filteredDevices.length && filteredDevices.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>MAC Address</TableHead>
                        <TableHead>Voucher ID</TableHead>
                        <TableHead>Connected</TableHead>
                        <TableHead>Expires In</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {filteredDevices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <p className="text-muted-foreground">No connected devices found</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDevices.map((device) => {
                            const statusInfo = statusConfig[device.status];
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                              <motion.tr
                                key={device.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="group"
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={selectedDevices.includes(device.id)}
                                    onCheckedChange={(checked) =>
                                      handleSelectDevice(device.id, checked as boolean)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="font-mono text-sm">{device.macAddress}</TableCell>
                                <TableCell className="font-mono text-sm">{device.voucherId}</TableCell>
                                <TableCell className="text-sm">
                                  {formatDate(device.createdAt)}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {device.status === 'active' ? (
                                    getTimeUntilExpiry(device.expiresAt)
                                  ) : (
                                    <span className="text-red-500">Expired</span>
                                  )}
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
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => openDeleteDialog(device)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </motion.tr>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}

              {filteredDevices.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredDevices.length} of {connectedUsers.length} devices
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Device</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {selectedDevice?.macAddress}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDevice}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
