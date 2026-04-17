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
  sessionsService
} from '@/lib/api/services/mikrotik';
import { routerDevicesService } from '@/lib/api/services/base-operations';
import { useUserStore } from '@/lib/store/user-store';
import { ApiError } from '@/lib/api/client';
import type { Device as ApiDevice, RouterDevice } from '@/lib/api/types';

// Device types
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

// Configuration template
interface ConfigTemplate {
  id: string;
  name: string;
  type: Device['type'];
  description: string;
  config: string;
}


const configTemplates: ConfigTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Basic Router Config',
    type: 'router',
    description: 'Standard router configuration with DHCP and NAT',
    config: `# XETIHUB Router Configuration
# Generated: {{date}}

interface WAN
  ip dhcp-client
  nat enable

interface LAN
  ip address 192.168.1.1/24
  dhcp-server enable
  dhcp-pool start 192.168.1.100
  dhcp-pool end 192.168.1.200

firewall enable
firewall default-policy drop

# Security
ssh enable
password encrypted {{password_hash}}
`,
  },
  {
    id: 'tpl-2',
    name: 'Access Point Config',
    type: 'access_point',
    description: 'WiFi access point with WPA3 security',
    config: `# XETIHUB Access Point Configuration
# Generated: {{date}}

wireless
  ssid "{{ssid}}"
  security wpa3-personal
  password "{{wifi_password}}"
  channel auto
  bandwidth 80MHz
  
management
  ip dhcp-client
  vlan 100
  
radius
  server {{radius_server}}
  secret {{radius_secret}}
`,
  },
  {
    id: 'tpl-3',
    name: 'Switch Config',
    type: 'switch',
    description: 'Managed switch with VLAN support',
    config: `# XETIHUB Switch Configuration
# Generated: {{date}}

hostname {{device_name}}

vlan 10
  name "Management"
vlan 20
  name "Users"
vlan 30
  name "Servers"

interface range 1-24
  switchport mode access
  switchport access vlan 20
  
interface 25-26
  switchport mode trunk
  switchport trunk allowed vlan all
`,
  },
];

// Map API device to local Device interface
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

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [routerDevices, setRouterDevices] = useState<RouterDevice[]>([]);
  const [isLoadingRouters, setIsLoadingRouters] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<RouterDevice | null>(null);
  const [routerDetailsOpen, setRouterDetailsOpen] = useState(false);
  const [addRouterDialogOpen, setAddRouterDialogOpen] = useState(false);
  const [newRouter, setNewRouter] = useState({
    name: '',
    ipAddress: '',
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

  useEffect(() => {
    fetchDevices();
    fetchRouterDevices();
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

  const handleAddRouter = async () => {
    if (!user?.client_id || !newRouter.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await routersService.create({
        name: newRouter.name,
        ipAddress: newRouter.ipAddress,
        apiPort: newRouter.apiPort,
        apiUser: newRouter.apiUser,
        apiPassword: newRouter.apiPassword,
        client_id: user.client_id,
      });
      toast.success('Router registered successfully');
      setAddRouterDialogOpen(false);
      setNewRouter({ name: '', ipAddress: '', apiPort: 8728, apiUser: '', apiPassword: '' });
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

  const handleDownloadLoginConfig = async (routerId: string) => {
    console.log('Downloading login config for router:', routerId);
    if (!user?.client_id) {
      toast.error('Missing client ID');
      return;
    }

    try {
      const urlx = `https://zota.xylepayments.com/mikrotik/portal/download-login?client_id=${user.client_id}&router_id=${routerId}`;
      const response = await fetch(
        urlx,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${useUserStore.getState().session?.token || ''}`,
            'client_id': user.client_id,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download configuration');
      }

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
  
  // New device form
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'router' as Device['type'],
    mac: '',
    ip: '',
    location: '',
  });

  // Generated config
  const [generatedConfig, setGeneratedConfig] = useState('');

  // Filter devices
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.mac.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ip.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesType = typeFilter === 'all' || d.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [devices, searchQuery, statusFilter, typeFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter((d) => d.status === 'online').length,
    offline: devices.filter((d) => d.status === 'offline').length,
    provisioning: devices.filter((d) => d.status === 'provisioning').length,
  }), [devices]);

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
        ipAddress: newDevice.ip || '0.0.0.0',
        location: newDevice.location,
        client_id: user.client_id,
      });
      setAddDialogOpen(false);
      setNewDevice({ name: '', type: 'router', mac: '', ip: '', location: '' });
      toast.success('Device added successfully');
      fetchDevices();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add device');
    }
  };

  const handleGenerateConfig = (device: Device) => {
    const template = configTemplates.find((t) => t.type === device.type) || configTemplates[0];
    const config = template.config
      .replace('{{date}}', new Date().toISOString())
      .replace('{{device_name}}', device.name)
      .replace('{{ssid}}', 'XETIHUB-WiFi')
      .replace('{{wifi_password}}', 'SecurePassword123')
      .replace('{{password_hash}}', '$6$rounds=5000$salt$hash')
      .replace('{{radius_server}}', '192.168.1.10')
      .replace('{{radius_secret}}', 'radius_secret_key');
    
    setGeneratedConfig(config);
    setSelectedDevice(device);
    setConfigDialogOpen(true);
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
    setDevices(devices.map((d) => 
      d.id === id ? { ...d, status: 'provisioning' as const } : d
    ));
    toast.success('Device reboot initiated');
    
    // Simulate coming back online
    setTimeout(() => {
      setDevices((prev) => prev.map((d) => 
        d.id === id ? { ...d, status: 'online' as const } : d
      ));
    }, 3000);
  };

  const handleDownloadPortal = () => {
    if (!user?.client_id || !portalIP.trim()) {
      toast.error('Client ID or Router IP is missing');
      return;
    }

    const url = `https://zota.xylepayments.com/mikrotik/portal/download-login?client_id=${user.client_id}&router_id=${portalIP.trim()}`;

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `portal-${portalIP}.html`; // Suggest filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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
                  <DialogDescription>
                    Register a new device for configuration
                  </DialogDescription>
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
                        onValueChange={(value: Device['type']) => setNewDevice({ ...newDevice, type: value })}
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
                      <Label>IP Address</Label>
                      <Input
                        value={newDevice.ip}
                        onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                        placeholder="192.168.1.1"
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
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
            {/* <TabsTrigger value="devices" className="text-xs sm:text-sm">Devices</TabsTrigger> */}
            <TabsTrigger value="routers" className="text-xs sm:text-sm">Router Devices</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm">Config Templates</TabsTrigger>
          </TabsList>


          {/* Router Devices Tab */}
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
                      <Label>IP Address</Label>
                      <Input
                        value={newRouter.ipAddress}
                        onChange={(e) => setNewRouter({ ...newRouter, ipAddress: e.target.value })}
                        placeholder="192.168.1.1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>API Port</Label>
                        <Input
                          type="number"
                          value={newRouter.apiPort}
                          onChange={(e) => setNewRouter({ ...newRouter, apiPort: parseInt(e.target.value) })}
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
                        onChange={(e) => setNewRouter({ ...newRouter, apiPassword: e.target.value })}
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
                <CardContent className="pt-6 text-center">
                  Loading router devices...
                </CardContent>
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
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Router className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{router.name}</CardTitle>
                            <CardDescription className="text-xs">{router.ipAddress}</CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={router.isConnected ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}
                        >
                          <Wifi className="h-3 w-3 mr-1" />
                          {router.isConnected ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {router.connectedDevices ? `${router.connectedDevices} connected devices` : 'No active connections'}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-8 text-xs"
                          onClick={() => {
                            setSelectedRouter(router);
                            setRouterDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-8 text-xs"
                          onClick={() => handleDownloadLoginConfig(router.id)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download Config
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

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {configTemplates.map((template) => {
                const typeInfo = typeConfig[template.type];
                const TypeIcon = typeInfo.icon;
                
                return (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg bg-muted', typeInfo.color)}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px] rounded border bg-muted/30 p-3">
                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                          {template.config}
                        </pre>
                      </ScrollArea>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        {template.type === 'router' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setPortalDialogOpen(true)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Portal
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Config Generation Dialog */}
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Generated Configuration
              </DialogTitle>
              <DialogDescription>
                Configuration for {selectedDevice?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showSecrets}
                    onCheckedChange={setShowSecrets}
                  />
                  <Label>Show Secrets</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedConfig);
                    toast.success('Configuration copied');
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Config
                </Button>
              </div>
              <ScrollArea className="h-[400px] rounded border bg-zinc-950 p-4">
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                  {showSecrets ? generatedConfig : generatedConfig.replace(/password.*|secret.*/gi, '********')}
                </pre>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Close
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Config
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Portal Download Dialog */}
        <Dialog open={portalDialogOpen} onOpenChange={setPortalDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Download HTML Portal</DialogTitle>
              <DialogDescription>
                Enter the router IP address to download the configured portal
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Router IP Address</Label>
                <Input
                  value={portalIP}
                  onChange={(e) => setPortalIP(e.target.value)}
                  placeholder="192.168.1.1"
                  type="text"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPortalDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDownloadPortal}>
                <Download className="h-4 w-4 mr-2" />
                Download Portal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
