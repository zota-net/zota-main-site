'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Router as RouterIcon,
  Users,
  Wifi,
  WifiOff,
  Search,
  RefreshCw,
  Trash2,
  UserX,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Download,
  Upload,
  Clock,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Copy,
  MoreHorizontal,
  Zap,
  Ban,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  hotspotUsersService,
  sessionsService,
  routersService,
} from '@/lib/api/services/mikrotik';
import { routerDevicesService } from '@/lib/api/services/base-operations';
import { useUserStore } from '@/lib/store/user-store';
import { ApiError } from '@/lib/api/client';
import type { HotspotUser, RouterSession, RouterDevice } from '@/lib/api/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: string | number): string {
  const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (!b || isNaN(b)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let val = b;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function parseUptime(uptime: string): string {
  if (!uptime || uptime === '0s') return '—';
  return uptime;
}

function isMacAddress(name: string): boolean {
  return /^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/.test(name);
}

function isSystemUser(user: HotspotUser): boolean {
  return (
    user.default === 'true' ||
    user.name === 'admin' ||
    user.name === 'undefined' ||
    user.comment?.includes('trial') === true
  );
}

type SortKey = 'name' | 'bytes-in' | 'bytes-out' | 'uptime' | 'disabled';
type SortDir = 'asc' | 'desc';

// ─── Component ───────────────────────────────────────────────────────────────

export default function RouterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const routerId = params.routerId as string;

  const [routerInfo, setRouterInfo] = useState<RouterDevice | null>(null);
  const [users, setUsers] = useState<HotspotUser[]>([]);
  const [sessions, setSessions] = useState<RouterSession[]>([]);
  const [isLoadingRouter, setIsLoadingRouter] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [kickTarget, setKickTarget] = useState<{
    type: 'user' | 'session';
    name: string;
    mac?: string;
  } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<HotspotUser | null>(null);

  const user = useUserStore((s) => s.user);

  // ─── Fetch data ──────────────────────────────────────────────────────

  const fetchRouter = useCallback(async () => {
    try {
      setIsLoadingRouter(true);
      const data = await routerDevicesService.getById(routerId);
      setRouterInfo(data as RouterDevice);
    } catch {
      // Fallback: try the mikrotik routers service
      try {
        const data = await routersService.getById(routerId);
        setRouterInfo(data as unknown as RouterDevice);
      } catch {
        toast.error('Failed to load router info');
      }
    } finally {
      setIsLoadingRouter(false);
    }
  }, [routerId]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const response = await hotspotUsersService.getAll(routerId);
      const usersData = response?.data ?? (response as unknown as HotspotUser[]);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Failed to fetch hotspot users:', err);
      toast.error(err instanceof ApiError ? err.message : 'Failed to load hotspot users');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [routerId]);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const data = await sessionsService.getActive(routerId);
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      // Sessions may not be available if router is offline
    } finally {
      setIsLoadingSessions(false);
    }
  }, [routerId]);

  useEffect(() => {
    if (routerId) {
      fetchRouter();
      fetchUsers();
      fetchSessions();
    }
  }, [routerId, fetchRouter, fetchUsers, fetchSessions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchUsers(), fetchSessions()]);
    setIsRefreshing(false);
    toast.success('Data refreshed');
  };

  // ─── Actions ─────────────────────────────────────────────────────────

  const handleKickUser = async (username: string) => {
    setActionLoading(username);
    try {
      await sessionsService.kickByUsername(routerId, username);
      toast.success(`Kicked ${username} from the hotspot`);
      fetchSessions();
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to kick ${username}`);
    } finally {
      setActionLoading(null);
      setKickTarget(null);
    }
  };

  const handleKickByMac = async (mac: string) => {
    setActionLoading(mac);
    try {
      await sessionsService.kickByMac(routerId, mac);
      toast.success(`Kicked device ${mac}`);
      fetchSessions();
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to kick device`);
    } finally {
      setActionLoading(null);
      setKickTarget(null);
    }
  };

  const handleRemoveUser = async (username: string) => {
    setActionLoading(username);
    try {
      await hotspotUsersService.remove(routerId, username);
      toast.success(`Removed ${username} from hotspot users`);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to remove ${username}`);
    } finally {
      setActionLoading(null);
      setRemoveTarget(null);
    }
  };

  const handleDisableUser = async (username: string) => {
    setActionLoading(username);
    try {
      await hotspotUsersService.disable(routerId, username);
      toast.success(`Disabled ${username}`);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to disable ${username}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnableUser = async (username: string) => {
    setActionLoading(username);
    try {
      await hotspotUsersService.enable(routerId, username);
      toast.success(`Enabled ${username}`);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to enable ${username}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // ─── Sorting & Filtering ────────────────────────────────────────────

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  const regularUsers = useMemo(
    () => users.filter((u) => !isSystemUser(u)),
    [users]
  );

  const filteredUsers = useMemo(() => {
    let result = regularUsers.filter((u) => {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        (u.password?.toLowerCase().includes(q) ?? false) ||
        (u.profile?.toLowerCase().includes(q) ?? false)
      );
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'bytes-in':
          cmp = parseInt(a['bytes-in'] || '0') - parseInt(b['bytes-in'] || '0');
          break;
        case 'bytes-out':
          cmp = parseInt(a['bytes-out'] || '0') - parseInt(b['bytes-out'] || '0');
          break;
        case 'uptime':
          cmp = (a.uptime || '').localeCompare(b.uptime || '');
          break;
        case 'disabled':
          cmp = a.disabled.localeCompare(b.disabled);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [regularUsers, searchQuery, sortKey, sortDir]);

  // ─── Stats ───────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const active = regularUsers.filter((u) => u.disabled === 'false');
    const disabled = regularUsers.filter((u) => u.disabled === 'true');
    const totalDownload = regularUsers.reduce(
      (sum, u) => sum + parseInt(u['bytes-out'] || '0'),
      0
    );
    const totalUpload = regularUsers.reduce(
      (sum, u) => sum + parseInt(u['bytes-in'] || '0'),
      0
    );
    return {
      total: regularUsers.length,
      active: active.length,
      disabled: disabled.length,
      sessions: sessions.length,
      totalDownload,
      totalUpload,
    };
  }, [regularUsers, sessions]);

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/devices')}
              className="h-9 w-9 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 truncate">
                  <RouterIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 shrink-0" />
                  <span className="truncate">
                    {isLoadingRouter ? 'Loading...' : routerInfo?.name || 'Router Details'}
                  </span>
                </h1>
                {routerInfo && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0',
                      routerInfo.isConnected
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    )}
                  >
                    {routerInfo.isConnected ? (
                      <Wifi className="h-3 w-3 mr-1" />
                    ) : (
                      <WifiOff className="h-3 w-3 mr-1" />
                    )}
                    {routerInfo.isConnected ? 'Online' : 'Offline'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {routerInfo?.ipAddress && (
                  <span className="font-mono text-xs">{routerInfo.ipAddress}</span>
                )}
                {routerInfo?.ipAddress && ' · '}
                Hotspot users & active sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-12">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Total Users',
              value: stats.total,
              icon: Users,
              color: 'text-blue-500',
              bgColor: 'bg-blue-500/10',
            },
            {
              label: 'Active Users',
              value: stats.active,
              icon: CheckCircle2,
              color: 'text-emerald-500',
              bgColor: 'bg-emerald-500/10',
            },
            {
              label: 'Total Download',
              value: formatBytes(stats.totalDownload),
              icon: Download,
              color: 'text-violet-500',
              bgColor: 'bg-violet-500/10',
              isString: true,
            },
            {
              label: 'Total Upload',
              value: formatBytes(stats.totalUpload),
              icon: Upload,
              color: 'text-amber-500',
              bgColor: 'bg-amber-500/10',
              isString: true,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    <div className={cn('p-1.5 rounded-md', stat.bgColor)}>
                      <stat.icon className={cn('h-3.5 w-3.5', stat.color)} />
                    </div>
                  </div>
                  <p className={cn('text-2xl font-bold', stat.color)}>
                    {stat.isString ? (
                      stat.value
                    ) : (
                      <AnimatedCounter value={stat.value as number} />
                    )}
                  </p>
                </CardContent>
                {/* Decorative gradient */}
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-[2px] opacity-60',
                    stat.color === 'text-blue-500' && 'bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0',
                    stat.color === 'text-emerald-500' && 'bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0',
                    stat.color === 'text-violet-500' && 'bg-gradient-to-r from-violet-500/0 via-violet-500 to-violet-500/0',
                    stat.color === 'text-amber-500' && 'bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0'
                  )}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs: Users & Sessions */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Hotspot Users ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs sm:text-sm">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Active Sessions ({stats.sessions})
            </TabsTrigger>
          </TabsList>

          {/* ─── Users Tab ──────────────────────────────────────────── */}
          <TabsContent value="users" className="space-y-4">
            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, password, or profile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {isLoadingUsers ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading hotspot users...</p>
                </CardContent>
              </Card>
            ) : filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No users match your search' : 'No hotspot users found'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Card>
                    <ScrollArea className="w-full">
                      <div className="min-w-[800px]">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              {[
                                { key: 'name' as SortKey, label: 'User / MAC' },
                                { key: 'bytes-out' as SortKey, label: 'Download' },
                                { key: 'bytes-in' as SortKey, label: 'Upload' },
                                { key: 'uptime' as SortKey, label: 'Uptime' },
                                { key: 'disabled' as SortKey, label: 'Status' },
                              ].map((col) => (
                                <th
                                  key={col.key}
                                  className="h-10 px-4 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                                  onClick={() => handleSort(col.key)}
                                >
                                  <span className="flex items-center gap-1.5">
                                    {col.label}
                                    <SortIcon column={col.key} />
                                  </span>
                                </th>
                              ))}
                              <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground w-[100px]">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <AnimatePresence mode="popLayout">
                              {filteredUsers.map((u, idx) => (
                                <motion.tr
                                  key={u['.id']}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  transition={{ delay: idx * 0.02 }}
                                  className={cn(
                                    'border-b last:border-0 hover:bg-muted/40 transition-colors group',
                                    u.disabled === 'true' && 'opacity-50'
                                  )}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                                          isMacAddress(u.name)
                                            ? 'bg-violet-500/10 text-violet-500'
                                            : 'bg-blue-500/10 text-blue-500'
                                        )}
                                      >
                                        {isMacAddress(u.name)
                                          ? u.name.slice(-5).replace(':', '')
                                          : u.name.slice(0, 2).toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium truncate max-w-[180px]">
                                          {u.name}
                                        </p>
                                        {u.password && (
                                          <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                                            {u.password}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 text-sm">
                                      <Download className="h-3 w-3 text-muted-foreground" />
                                      {formatBytes(u['bytes-out'])}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 text-sm">
                                      <Upload className="h-3 w-3 text-muted-foreground" />
                                      {formatBytes(u['bytes-in'])}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {parseUptime(u.uptime || '0s')}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'text-[10px] px-2 py-0.5',
                                        u.disabled === 'false'
                                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                                      )}
                                    >
                                      {u.disabled === 'false' ? 'Active' : 'Disabled'}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => setSelectedUser(u)}>
                                          <Users className="h-3.5 w-3.5 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleCopy(u.name, 'Username')}
                                        >
                                          <Copy className="h-3.5 w-3.5 mr-2" />
                                          Copy Username
                                        </DropdownMenuItem>
                                        {u.password && (
                                          <DropdownMenuItem
                                            onClick={() => handleCopy(u.password!, 'Password')}
                                          >
                                            <Copy className="h-3.5 w-3.5 mr-2" />
                                            Copy Password
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setKickTarget({ type: 'user', name: u.name })
                                          }
                                        >
                                          <Zap className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                          Kick Session
                                        </DropdownMenuItem>
                                        {u.disabled === 'false' ? (
                                          <DropdownMenuItem
                                            onClick={() => handleDisableUser(u.name)}
                                          >
                                            <Ban className="h-3.5 w-3.5 mr-2 text-orange-500" />
                                            Disable User
                                          </DropdownMenuItem>
                                        ) : (
                                          <DropdownMenuItem
                                            onClick={() => handleEnableUser(u.name)}
                                          >
                                            <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                            Enable User
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onClick={() => setRemoveTarget(u.name)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                                          Remove User
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </div>
                    </ScrollArea>
                  </Card>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {filteredUsers.map((u, idx) => (
                    <motion.div
                      key={u['.id']}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Card
                        className={cn(
                          'hover:border-primary/30 transition-colors',
                          u.disabled === 'true' && 'opacity-50'
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  'h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                                  isMacAddress(u.name)
                                    ? 'bg-violet-500/10 text-violet-500'
                                    : 'bg-blue-500/10 text-blue-500'
                                )}
                              >
                                {isMacAddress(u.name)
                                  ? u.name.slice(-5).replace(':', '')
                                  : u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{u.name}</p>
                                {u.password && (
                                  <p className="text-xs text-muted-foreground font-mono truncate">
                                    {u.password}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] px-2 py-0.5',
                                  u.disabled === 'false'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                )}
                              >
                                {u.disabled === 'false' ? 'Active' : 'Disabled'}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => setSelectedUser(u)}>
                                    <Users className="h-3.5 w-3.5 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setKickTarget({ type: 'user', name: u.name })
                                    }
                                  >
                                    <Zap className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                    Kick Session
                                  </DropdownMenuItem>
                                  {u.disabled === 'false' ? (
                                    <DropdownMenuItem
                                      onClick={() => handleDisableUser(u.name)}
                                    >
                                      <Ban className="h-3.5 w-3.5 mr-2 text-orange-500" />
                                      Disable
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => handleEnableUser(u.name)}
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                      Enable
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setRemoveTarget(u.name)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-md bg-muted/40 p-2">
                              <Download className="h-3 w-3 mx-auto mb-1 text-violet-500" />
                              <p className="text-xs font-medium">{formatBytes(u['bytes-out'])}</p>
                              <p className="text-[10px] text-muted-foreground">Download</p>
                            </div>
                            <div className="rounded-md bg-muted/40 p-2">
                              <Upload className="h-3 w-3 mx-auto mb-1 text-amber-500" />
                              <p className="text-xs font-medium">{formatBytes(u['bytes-in'])}</p>
                              <p className="text-[10px] text-muted-foreground">Upload</p>
                            </div>
                            <div className="rounded-md bg-muted/40 p-2">
                              <Clock className="h-3 w-3 mx-auto mb-1 text-blue-500" />
                              <p className="text-xs font-medium">{parseUptime(u.uptime || '0s')}</p>
                              <p className="text-[10px] text-muted-foreground">Uptime</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ─── Sessions Tab ───────────────────────────────────────── */}
          <TabsContent value="sessions" className="space-y-4">
            {isLoadingSessions ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading active sessions...</p>
                </CardContent>
              </Card>
            ) : sessions.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No active sessions on this router
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Sessions will appear here when users connect
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Card>
                    <ScrollArea className="w-full">
                      <div className="min-w-[700px]">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                                Username
                              </th>
                              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                                MAC Address
                              </th>
                              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                                IP Address
                              </th>
                              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                                Uptime
                              </th>
                              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                                Download
                              </th>
                              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                                Upload
                              </th>
                              <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground w-[80px]">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((s, idx) => (
                              <motion.tr
                                key={`${s.macAddress}-${idx}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="border-b last:border-0 hover:bg-muted/40 transition-colors group"
                              >
                                <td className="px-4 py-3">
                                  <p className="text-sm font-medium">{s.username}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-mono text-muted-foreground">
                                    {s.macAddress}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-mono text-muted-foreground">
                                    {s.ipAddress}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {parseUptime(s.uptime)}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm">{formatBytes(s.bytesOut)}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm">{formatBytes(s.bytesIn)}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setKickTarget({
                                            type: 'session',
                                            name: s.username,
                                          })
                                        }
                                      >
                                        <UserX className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                        Kick by Username
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setKickTarget({
                                            type: 'session',
                                            name: s.username,
                                            mac: s.macAddress,
                                          })
                                        }
                                      >
                                        <Ban className="h-3.5 w-3.5 mr-2 text-red-500" />
                                        Kick by MAC
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleCopy(s.macAddress, 'MAC Address')}
                                      >
                                        <Copy className="h-3.5 w-3.5 mr-2" />
                                        Copy MAC
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleCopy(s.ipAddress, 'IP Address')}
                                      >
                                        <Copy className="h-3.5 w-3.5 mr-2" />
                                        Copy IP
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ScrollArea>
                  </Card>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {sessions.map((s, idx) => (
                    <motion.div
                      key={`${s.macAddress}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Card className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-medium">{s.username}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {s.macAddress}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">{s.ipAddress}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-amber-600 hover:text-amber-700"
                                onClick={() =>
                                  setKickTarget({ type: 'session', name: s.username })
                                }
                              >
                                <UserX className="h-3 w-3 mr-1" />
                                Kick
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-md bg-muted/40 p-2">
                              <Clock className="h-3 w-3 mx-auto mb-1 text-blue-500" />
                              <p className="text-xs font-medium">{parseUptime(s.uptime)}</p>
                            </div>
                            <div className="rounded-md bg-muted/40 p-2">
                              <Download className="h-3 w-3 mx-auto mb-1 text-violet-500" />
                              <p className="text-xs font-medium">{formatBytes(s.bytesOut)}</p>
                            </div>
                            <div className="rounded-md bg-muted/40 p-2">
                              <Upload className="h-3 w-3 mx-auto mb-1 text-amber-500" />
                              <p className="text-xs font-medium">{formatBytes(s.bytesIn)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* ─── User Detail Dialog ──────────────────────────────────── */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="w-[95vw] max-w-lg p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                User Details
              </DialogTitle>
              <DialogDescription>
                Full details for hotspot user{' '}
                <span className="font-medium text-foreground font-mono">
                  {selectedUser?.name}
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Username / MAC', value: selectedUser.name },
                    { label: 'Password', value: selectedUser.password || '—' },
                    { label: 'Profile', value: selectedUser.profile || 'default' },
                    {
                      label: 'Status',
                      value: selectedUser.disabled === 'false' ? 'Active' : 'Disabled',
                    },
                    { label: 'Uptime', value: parseUptime(selectedUser.uptime || '0s') },
                    {
                      label: 'Limit Uptime',
                      value: selectedUser['limit-uptime'] || '—',
                    },
                    {
                      label: 'Download',
                      value: formatBytes(selectedUser['bytes-out']),
                    },
                    {
                      label: 'Upload',
                      value: formatBytes(selectedUser['bytes-in']),
                    },
                    {
                      label: 'Packets Out',
                      value: parseInt(selectedUser['packets-out'] || '0').toLocaleString(),
                    },
                    {
                      label: 'Packets In',
                      value: parseInt(selectedUser['packets-in'] || '0').toLocaleString(),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg bg-muted/40 border p-3 space-y-1"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setKickTarget({ type: 'user', name: selectedUser.name });
                      setSelectedUser(null);
                    }}
                  >
                    <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                    Kick Session
                  </Button>
                  {selectedUser.disabled === 'false' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        handleDisableUser(selectedUser.name);
                        setSelectedUser(null);
                      }}
                    >
                      <Ban className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                      Disable
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        handleEnableUser(selectedUser.name);
                        setSelectedUser(null);
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                      Enable
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setRemoveTarget(selectedUser.name);
                      setSelectedUser(null);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ─── Kick Confirmation ───────────────────────────────────── */}
        <AlertDialog open={!!kickTarget} onOpenChange={() => setKickTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                Kick User Session
              </AlertDialogTitle>
              <AlertDialogDescription>
                {kickTarget?.mac ? (
                  <>
                    This will disconnect the device with MAC address{' '}
                    <span className="font-mono font-medium text-foreground">
                      {kickTarget.mac}
                    </span>{' '}
                    from the hotspot. They can reconnect if they have valid credentials.
                  </>
                ) : (
                  <>
                    This will disconnect{' '}
                    <span className="font-medium text-foreground">{kickTarget?.name}</span> from
                    the hotspot. They can reconnect if they have valid credentials.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  if (kickTarget?.mac) {
                    handleKickByMac(kickTarget.mac);
                  } else if (kickTarget) {
                    handleKickUser(kickTarget.name);
                  }
                }}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Kick User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ─── Remove Confirmation ─────────────────────────────────── */}
        <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Remove Hotspot User
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{' '}
                <span className="font-medium text-foreground">{removeTarget}</span> from the
                hotspot. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => removeTarget && handleRemoveUser(removeTarget)}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Remove User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
