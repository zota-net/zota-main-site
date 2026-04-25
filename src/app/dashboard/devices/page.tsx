'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Plus,
  Search,
  Download,
  Trash2,
  Copy,
  Check,
  Wifi,
  WifiOff,
  MoreHorizontal,
  RefreshCw,
  Settings,
  QrCode,
  Code,
  Terminal,
  Eye,
  EyeOff,
  Router,
  Server,
  MonitorSmartphone,
  Key,
  Shield,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageTransition, AnimatedCounter } from '@/components/common';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { devicesService } from '@/lib/api/services/devices';
import {
  routersService,
  routerStatsService,
  sessionsService,
} from '@/lib/api/services/mikrotik';
import { routerDevicesService } from '@/lib/api/services/base-operations';
import { useUserStore } from '@/lib/store/user-store';
import { ApiError } from '@/lib/api/client';
import type { Device as ApiDevice, RouterDevice } from '@/lib/api/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Device {
  id: string;
  name: string;
  type: 'router' | 'access_point' | 'switch' | 'gateway' | 'endpoint';
  status: 'online' | 'offline' | 'provisioning' | 'error';
  mac: string;
  ip: string;
  firmware: string;
  lastSeen: Date;
  configCode?: string;
  location?: string;
  model?: string;
}

// ─── Setup Guide Data ─────────────────────────────────────────────────────────

const XETIHUB_IP = '143.198.195.245';

interface SetupStep {
  title: string;
  description: string;
  code?: string;
  note?: string;
}

interface DeviceGuide {
  id: string;
  label: string;
  icon: React.ElementType<{ className?: string }>;
  color: string;
  bgColor: string;
  type: 'mikrotik' | 'radius';
  intro: string;
  steps: SetupStep[];
}

const deviceGuides: DeviceGuide[] = [
  {
    id: 'mikrotik',
    label: 'MikroTik Router',
    icon: Router,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    type: 'mikrotik',
    intro: 'Full WireGuard VPN setup with hotspot portal integration.',
    steps: [
      {
        title: 'Create the WireGuard interface',
        description:
          'Open your MikroTik terminal via Winbox or SSH and run the command below to create the VPN interface.',
        code: '/interface wireguard add name=wg0 listen-port=51820',
      },
      {
        title: 'Get your router\'s public key',
        description:
          'Run the print command to retrieve the WireGuard public key — you will need it in the next step.',
        code: '/interface wireguard print',
        note: 'Copy the public-key value from the output. It is a long base64 string.',
      },
      {
        title: 'Register the router on the dashboard',
        description:
          'Go to Devices → Add Router. Fill in the router name, paste the public key you copied, leave the API port at 8728 (default), and enter your MikroTik admin username and password.',
        note: 'The API port 8728 is the default MikroTik REST API port. Only change it if you have customised it on your router.',
      },
      {
        title: 'Run the configuration commands',
        description:
          'After adding the router, click Configurations on the router card. A dialog will appear with commands tailored specifically to your router. Copy and paste all of them into your MikroTik terminal to complete the VPN connection.',
        note: 'These commands are unique to your router and will not work on a different device.',
      },
      {
        title: 'Download and upload the hotspot portal',
        description:
          'Click Download Portal on the router card. Unzip the downloaded file, then drag and drop the folder into your MikroTik router\'s file storage via Winbox Files or FTP. Then set your hotspot HTML directory to point to that folder.',
        note: 'The portal file is tied to this specific router. It will not work on other routers.',
      },
      {
        title: 'Allow traffic from the XETIHUB server',
        description:
          'Add the XETIHUB server IP to your hotspot walled garden so that portal traffic is not blocked. In MikroTik go to IP → Hotspot → Walled Garden and add this as an allowed destination.',
        code: XETIHUB_IP,
        note: 'This step is required for the portal to load and authenticate users correctly.',
      },
    ],
  },
  {
    id: 'tplink',
    label: 'TP-Link',
    icon: Wifi,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    type: 'radius',
    intro: 'Uses RADIUS authentication with the XETIHUB online portal.',
    steps: [
      {
        title: 'Configure RADIUS authentication',
        description:
          'In your TP-Link controller or device admin panel, navigate to Authentication → RADIUS and add a new server with the details below.',
        code: `Server IP:   ${XETIHUB_IP}\nAuth Port:   1812\nAcct Port:   1813`,
        note: 'Get your RADIUS shared secret from the XETIHUB dashboard under Settings.',
      },
      {
        title: 'Set the captive portal URL',
        description:
          'In your TP-Link hotspot or captive portal settings, update the portal redirect URL to point to your XETIHUB-hosted portal address.',
        note: 'Your portal URL is unique to your client account. Contact support if you do not have it yet.',
      },
      {
        title: 'Allow XETIHUB server traffic',
        description:
          'Add the XETIHUB server IP to your walled garden or allowed hosts list so portal and authentication traffic is not blocked before login.',
        code: XETIHUB_IP,
      },
    ],
  },
  {
    id: 'ruijie',
    label: 'Ruijie',
    icon: Server,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    type: 'radius',
    intro: 'Uses RADIUS authentication with the XETIHUB online portal.',
    steps: [
      {
        title: 'Add a RADIUS server',
        description:
          'In the Ruijie admin interface, go to Authentication → RADIUS Server and create a new entry with the following details.',
        code: `Server IP:   ${XETIHUB_IP}\nAuth Port:   1812\nAcct Port:   1813`,
        note: 'Get your RADIUS shared secret from the XETIHUB dashboard under Settings.',
      },
      {
        title: 'Set the web authentication portal URL',
        description:
          'In Ruijie portal settings, update the web authentication redirect URL to your XETIHUB-hosted portal link for your account.',
        note: 'Your portal URL is tied to your client account. Contact support to retrieve it.',
      },
      {
        title: 'Allow XETIHUB server in firewall rules',
        description:
          'Ensure the XETIHUB server IP is allowed through your pre-authentication access rules so that portal and RADIUS traffic can pass freely.',
        code: XETIHUB_IP,
      },
    ],
  },
  {
    id: 'ubiquiti',
    label: 'Ubiquiti UniFi',
    icon: Shield,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    type: 'radius',
    intro: 'Uses RADIUS authentication with an external guest portal.',
    steps: [
      {
        title: 'Create a RADIUS profile',
        description:
          'In UniFi Network, go to Settings → Profiles → RADIUS and create a new profile with the following server details.',
        code: `Server IP:   ${XETIHUB_IP}\nAuth Port:   1812\nAcct Port:   1813`,
        note: 'Get your RADIUS shared secret from the XETIHUB dashboard under Settings.',
      },
      {
        title: 'Assign the profile to your wireless network',
        description:
          'Edit your WiFi network in UniFi and under Security, set the RADIUS profile to the one you just created. Enable MAC-based or 802.1X authentication as required.',
      },
      {
        title: 'Enable the guest portal with external URL',
        description:
          'Under Hotspot → Guest Portal, enable the portal and select External Portal. Set the redirect URL to your XETIHUB-hosted portal address.',
        note: 'UniFi will redirect unauthenticated clients to that URL automatically.',
      },
      {
        title: 'Allow XETIHUB server in guest network restrictions',
        description:
          'Add the XETIHUB IP to the pre-authorisation access list in your guest network settings so clients can reach the portal before logging in.',
        code: XETIHUB_IP,
      },
    ],
  },
];

// ─── Setup Guide Component ────────────────────────────────────────────────────

function SetupGuide() {
  const [activeGuide, setActiveGuide] = useState<string>('mikrotik');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const guide = deviceGuides.find((g) => g.id === activeGuide)!;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Device selector */}
      <div className="flex flex-wrap gap-2">
        {deviceGuides.map((g) => {
          const Icon = g.icon;
          const isActive = activeGuide === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGuide(g.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                isActive
                  ? 'border-primary/50 bg-primary/5 text-primary font-medium'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
              )}
            >
              <div className={cn('p-1 rounded', isActive ? 'bg-primary/10' : g.bgColor)}>
                <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-primary' : g.color)} />
              </div>
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Guide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGuide}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="space-y-4"
        >
          {/* Guide header */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
            <div className={cn('p-2 rounded-lg mt-0.5', guide.bgColor)}>
              <guide.icon className={cn('h-4 w-4', guide.color)} />
            </div>
            <div>
              <p className="font-medium text-sm">{guide.label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{guide.intro}</p>
              {guide.type === 'radius' && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                    RADIUS
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Uses shared RADIUS server at {XETIHUB_IP}
                  </span>
                </div>
              )}
              {guide.type === 'mikrotik' && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                    WireGuard VPN
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                    Hotspot Portal
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {guide.steps.map((step, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg border bg-background">
                {/* Step number */}
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {i + 1}
                  </div>
                </div>

                {/* Step content */}
                <div className="flex-1 space-y-2 min-w-0">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                  {step.code && (
                    <div className="flex items-stretch gap-0 rounded-md border overflow-hidden">
                      <pre className="flex-1 bg-muted/50 px-3 py-2 text-xs font-mono text-foreground overflow-x-auto whitespace-pre">
                        {step.code}
                      </pre>
                      <button
                        onClick={() => handleCopy(step.code!, `${activeGuide}-${i}`)}
                        className="flex items-center gap-1.5 px-3 bg-muted/80 hover:bg-muted border-l text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      >
                        {copiedCode === `${activeGuide}-${i}` ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {step.note && (
                    <div className="flex gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2 border-l-2 border-border">
                      <span className="leading-relaxed">{step.note}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mapApiDevice = (d: ApiDevice): Device => ({
  id: d.id,
  name: d.name,
  type: (d.type || 'endpoint') as Device['type'],
  status: (d.status || 'offline') as Device['status'],
  mac: d.macAddress || '',
  ip: d.ipAddress || '',
  firmware: d.firmwareVersion || 'v1.0.0',
  lastSeen: new Date(d.lastSeen || d.createdAt),
  location: d.location,
  model: d.model,
});

const statusConfig = {
  online: { label: 'Online', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: Wifi },
  offline: { label: 'Offline', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: WifiOff },
  provisioning: { label: 'Provisioning', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: RefreshCw },
  error: { label: 'Error', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: WifiOff },
};

const typeConfig = {
  router: { label: 'Router', icon: Router, color: 'text-blue-500' },
  access_point: { label: 'Access Point', icon: Wifi, color: 'text-green-500' },
  switch: { label: 'Switch', icon: Server, color: 'text-purple-500' },
  gateway: { label: 'Gateway', icon: Shield, color: 'text-amber-500' },
  endpoint: { label: 'Endpoint', icon: MonitorSmartphone, color: 'text-cyan-500' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [routerDevices, setRouterDevices] = useState<RouterDevice[]>([]);
  const [isLoadingRouters, setIsLoadingRouters] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<RouterDevice | null>(null);
  const [routerDetailsOpen, setRouterDetailsOpen] = useState(false);
  const [addRouterDialogOpen, setAddRouterDialogOpen] = useState(false);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [routerConfig, setRouterConfig] = useState('');
  const [newRouter, setNewRouter] = useState({
    name: '',
    publicKey: '',
    apiPort: 8728,
    apiUser: '',
    apiPassword: '',
  });
  const user = useUserStore((s) => s.user);

  const fetchDevices = useCallback(async () => {
    if (!user?.client_id) return;
    try {
      setIsLoadingDevices(true);
      const data = await devicesService.getByClient(user.client_id);
      setDevices(data.map(mapApiDevice));
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      toast.error(err instanceof ApiError ? err.message : 'Failed to load devices');
    } finally {
      setIsLoadingDevices(false);
    }
  }, [user?.client_id]);

  const fetchRouterDevices = useCallback(async () => {
    if (!user?.client_id) return;
    try {
      setIsLoadingRouters(true);
      const data = await routerDevicesService.getByClient(user.client_id);
      setRouterDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch routers:', err);
      toast.error(err instanceof ApiError ? err.message : 'Failed to load routers');
    } finally {
      setIsLoadingRouters(false);
    }
  }, [user?.client_id]);

  useEffect(() => {
    fetchDevices();
    fetchRouterDevices();
  }, [user?.client_id]);

  const handleAddRouter = async () => {
    if (!user?.client_id || !newRouter.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await routersService.create({
        name: newRouter.name,
        publicKey: newRouter.publicKey,
        apiPort: newRouter.apiPort,
        apiUser: newRouter.apiUser,
        apiPassword: newRouter.apiPassword,
        client_id: user.client_id,
      });
      toast.success('Router registered successfully');
      setAddRouterDialogOpen(false);
      setNewRouter({ name: '', publicKey: '', apiPort: 8728, apiUser: '', apiPassword: '' });
      fetchRouterDevices();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to register router');
    }
  };

  const handleDeleteRouter = async (routerId: string) => {
    try {
      await routersService.delete(routerId);
      toast.success('Router deleted successfully');
      fetchRouterDevices();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete router');
    }
  };

  const handleViewRouterConfig = (router: RouterDevice) => {
    const vpsPublicKey = process.env.NEXT_PUBLIC_VPS_PUBLIC_KEY || '<VPS_PUBLIC_KEY>';
    const vpsIp = process.env.NEXT_PUBLIC_VPS_IP || '<VPS_IP>';

    const config = `# Run on MikroTik terminal after receiving from dashboard
      /interface wireguard add name=wg0 listen-port=51820
      /ip address add address=${router.ipAddress || '<ASSIGNED_IP>'}/24 interface=wg0
      /interface wireguard peers add \\
        interface=wg0 \\
        public-key="${vpsPublicKey}" \\
        endpoint-address=${vpsIp} \\
        endpoint-port=51820 \\
        allowed-address=10.0.0.1/32 \\
        persistent-keepalive=25
      /ip firewall filter add \\
        chain=input \\
        src-address=10.0.0.0/24 \\
        protocol=tcp \\
        dst-port=${router.apiPort || 8728} \\
        action=accept \\
        comment="Allow API over WireGuard"
      /ip firewall filter move [find comment="Allow API over WireGuard"] destination=0`;

    setRouterConfig(config);
    setSelectedRouter(router);
    setConfigDrawerOpen(true);
  };

  const handleDownloadLoginConfig = async (routerId: string) => {
    if (!user?.client_id) {
      toast.error('Missing client ID');
      return;
    }
    try {
      const urlx = `https://zota.xylepayments.com/mikrotik/portal/download-login?client_id=${user.client_id}&router_id=${routerId}`;
      const response = await fetch(urlx, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${useUserStore.getState().session?.token || ''}`,
          client_id: user.client_id,
        },
      });
      if (!response.ok) throw new Error('Failed to download configuration');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `xetihub-hotspot-${routerId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Login configuration downloaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download configuration');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [portalDialogOpen, setPortalDialogOpen] = useState(false);
  const [portalIP, setPortalIP] = useState('');
  const [generatedConfig, setGeneratedConfig] = useState('');

  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'router' as Device['type'],
    mac: '',
    publicKey: '',
    location: '',
  });

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.mac.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ip.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesType = typeFilter === 'all' || d.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [devices, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(
    () => ({
      total: devices.length,
      online: devices.filter((d) => d.status === 'online').length,
      offline: devices.filter((d) => d.status === 'offline').length,
      provisioning: devices.filter((d) => d.status === 'provisioning').length,
    }),
    [devices]
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Configuration code copied');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddDevice = async () => {
    if (!user?.client_id) return;
    try {
      await devicesService.add({
        name: newDevice.name || `DEVICE-${Date.now()}`,
        type: newDevice.type,
        macAddress: newDevice.mac,
        publicKey: newDevice.publicKey || '',
        location: newDevice.location,
        client_id: user.client_id,
      });
      setAddDialogOpen(false);
      setNewDevice({ name: '', type: 'router', mac: '', publicKey: '', location: '' });
      toast.success('Device added successfully');
      fetchDevices();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add device');
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      await devicesService.delete(id);
      toast.success('Device deleted');
      fetchDevices();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete device');
    }
  };

  const handleRebootDevice = (id: string) => {
    setDevices(devices.map((d) => (d.id === id ? { ...d, status: 'provisioning' as const } : d)));
    toast.success('Device reboot initiated');
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'online' as const } : d))
      );
    }, 3000);
  };

  const handleDownloadPortal = () => {
    if (!user?.client_id || !portalIP.trim()) {
      toast.error('Client ID or Router IP is missing');
      return;
    }
    const params = new URLSearchParams({
      client_id: user.client_id,
      router_id: portalIP.trim(),
      vps_public_key: process.env.NEXT_PUBLIC_VPS_PUBLIC_KEY || '',
    });
    window.location.href = `https://zota.xylepayments.com/mikrotik/portal/download-login?${params}`;
    setPortalDialogOpen(false);
    setPortalIP('');
    toast.success('Portal download initiated');
  };

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Device Configuration
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage devices and generate configuration codes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 sm:h-9">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export Configs</span>
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-8 sm:h-9">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Device</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Add New Device</DialogTitle>
                  <DialogDescription>Register a new device for configuration</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Device Name</Label>
                    <Input
                      value={newDevice.name}
                      onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                      placeholder="ROUTER-001"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Device Type</Label>
                      <Select
                        value={newDevice.type}
                        onValueChange={(value: Device['type']) =>
                          setNewDevice({ ...newDevice, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="router">Router</SelectItem>
                          <SelectItem value="access_point">Access Point</SelectItem>
                          <SelectItem value="switch">Switch</SelectItem>
                          <SelectItem value="gateway">Gateway</SelectItem>
                          <SelectItem value="endpoint">Endpoint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={newDevice.location}
                        onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                        placeholder="Main Office"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>MAC Address</Label>
                      <Input
                        value={newDevice.mac}
                        onChange={(e) => setNewDevice({ ...newDevice, mac: e.target.value })}
                        placeholder="AA:BB:CC:DD:EE:FF"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Public Key</Label>
                      <Input
                        value={newDevice.publicKey}
                        onChange={(e) => setNewDevice({ ...newDevice, publicKey: e.target.value })}
                        placeholder="public-key-here"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDevice}>Add Device</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Devices', value: stats.total, color: 'text-primary', icon: Smartphone },
            { label: 'Online', value: stats.online, color: 'text-green-500', icon: Wifi },
            { label: 'Offline', value: stats.offline, color: 'text-gray-500', icon: WifiOff },
            { label: 'Provisioning', value: stats.provisioning, color: 'text-blue-500', icon: RefreshCw },
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

        <Tabs defaultValue="routers" className="space-y-4 sm:space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="routers" className="text-xs sm:text-sm">
              Router Devices
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Setup Guide
            </TabsTrigger>
          </TabsList>

          {/* ── Router Devices Tab ─────────────────────────────────────────── */}
          <TabsContent value="routers" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Dialog open={addRouterDialogOpen} onOpenChange={setAddRouterDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-8 sm:h-9">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Router</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle>Register MikroTik Router</DialogTitle>
                    <DialogDescription>
                      Add a new MikroTik router to your network
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Router Name</Label>
                      <Input
                        value={newRouter.name}
                        onChange={(e) => setNewRouter({ ...newRouter, name: e.target.value })}
                        placeholder="Main Router"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>WireGuard Public Key</Label>
                      <Input
                        value={newRouter.publicKey}
                        onChange={(e) => setNewRouter({ ...newRouter, publicKey: e.target.value })}
                        placeholder="WireGuard public key for secure communication"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>API Port</Label>
                        <Input
                          type="number"
                          value={newRouter.apiPort}
                          onChange={(e) =>
                            setNewRouter({ ...newRouter, apiPort: parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>API User</Label>
                        <Input
                          value={newRouter.apiUser}
                          onChange={(e) => setNewRouter({ ...newRouter, apiUser: e.target.value })}
                          placeholder="api_user"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>API Password</Label>
                      <Input
                        type="password"
                        value={newRouter.apiPassword}
                        onChange={(e) =>
                          setNewRouter({ ...newRouter, apiPassword: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddRouterDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddRouter}>Register Router</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingRouters ? (
              <Card>
                <CardContent className="pt-6 text-center">Loading router devices...</CardContent>
              </Card>
            ) : routerDevices.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No router devices registered yet. Add one to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {routerDevices.map((router) => (
                  <Card key={router.id} className="group hover:border-primary/50 transition-colors">
                    <CardHeader
                      className="pb-3 cursor-pointer"
                      onClick={() => (window.location.href = `/dashboard/devices/${router.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Router className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <CardTitle className="text-base group-hover:text-primary transition-colors">
                              {router.name}
                            </CardTitle>
                            <CardDescription className="text-xs">{router.ipAddress}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            router.isConnected
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-gray-500/10 text-gray-500'
                          }
                        >
                          <Wifi className="h-3 w-3 mr-1" />
                          {router.isConnected ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {router.connectedDevices
                          ? `${router.connectedDevices} connected devices`
                          : 'No active connections'}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => handleViewRouterConfig(router)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Configurations
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => handleDownloadLoginConfig(router.id)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download Portal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDeleteRouter(router.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Setup Guide Tab ───────────────────────────────────────────── */}
          <TabsContent value="templates">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Device Setup Guide</CardTitle>
                </div>
                <CardDescription>
                  Step-by-step instructions for connecting your network devices to XETIHUB.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SetupGuide />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── WireGuard Config Dialog ──────────────────────────────────────── */}
        <Dialog open={configDrawerOpen} onOpenChange={setConfigDrawerOpen}>
          <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                MikroTik WireGuard Setup
              </DialogTitle>
              <DialogDescription>
                Run these commands in your MikroTik terminal for{' '}
                <span className="font-medium text-foreground">{selectedRouter?.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Copy and paste into your MikroTik terminal
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(routerConfig);
                    toast.success('Configuration copied to clipboard');
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>

              <ScrollArea className="h-[300px] rounded border bg-zinc-950 p-4">
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap break-all">
                  {routerConfig}
                </pre>
              </ScrollArea>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground border rounded-lg p-3 bg-muted/30">
                <div>
                  <span className="font-medium text-foreground block mb-0.5">Router Name</span>
                  <p>{selectedRouter?.name}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground block mb-0.5">Router IP</span>
                  <p>{selectedRouter?.ipAddress}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground block mb-0.5">API Port</span>
                  <p>{selectedRouter?.apiPort || 8728}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground block mb-0.5">Status</span>
                  <p className={selectedRouter?.isConnected ? 'text-green-500' : 'text-gray-500'}>
                    {selectedRouter?.isConnected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfigDrawerOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}