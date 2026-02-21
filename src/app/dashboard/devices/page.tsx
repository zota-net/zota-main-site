'use client';

import { useState, useMemo } from 'react';
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

// Generate mock devices
const generateDevices = (): Device[] => {
  const types: Device['type'][] = ['router', 'access_point', 'switch', 'gateway', 'endpoint'];
  const statuses: Device['status'][] = ['online', 'offline', 'provisioning', 'error'];
  const models = ['NetNet-R100', 'NetNet-AP200', 'NetNet-SW300', 'NetNet-GW400', 'NetNet-EP500'];
  const locations = ['Main Office', 'Branch A', 'Branch B', 'Warehouse', 'Data Center'];
  
  return Array.from({ length: 30 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = i < 20 ? 'online' : statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `device-${i + 1}`,
      name: `${type.replace('_', ' ').toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      type,
      status,
      mac: Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase(),
      ip: `192.168.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 254) + 1}`,
      firmware: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      configCode: `CFG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      model: models[types.indexOf(type)],
    };
  });
};

const configTemplates: ConfigTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Basic Router Config',
    type: 'router',
    description: 'Standard router configuration with DHCP and NAT',
    config: `# NetNet Router Configuration
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
    config: `# NetNet Access Point Configuration
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
    config: `# NetNet Switch Configuration
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

const initialDevices = generateDevices();

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
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
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

  const handleAddDevice = () => {
    const device: Device = {
      id: `device-${Date.now()}`,
      name: newDevice.name || `DEVICE-${Date.now()}`,
      type: newDevice.type,
      status: 'provisioning',
      mac: newDevice.mac || Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase(),
      ip: newDevice.ip || '0.0.0.0',
      firmware: 'v1.0.0',
      lastSeen: new Date(),
      configCode: `CFG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      location: newDevice.location,
      model: 'NetNet-NEW',
    };
    
    setDevices([device, ...devices]);
    setAddDialogOpen(false);
    setNewDevice({ name: '', type: 'router', mac: '', ip: '', location: '' });
    toast.success('Device added successfully');
  };

  const handleGenerateConfig = (device: Device) => {
    const template = configTemplates.find((t) => t.type === device.type) || configTemplates[0];
    const config = template.config
      .replace('{{date}}', new Date().toISOString())
      .replace('{{device_name}}', device.name)
      .replace('{{ssid}}', 'NetNet-WiFi')
      .replace('{{wifi_password}}', 'SecurePassword123')
      .replace('{{password_hash}}', '$6$rounds=5000$salt$hash')
      .replace('{{radius_server}}', '192.168.1.10')
      .replace('{{radius_secret}}', 'radius_secret_key');
    
    setGeneratedConfig(config);
    setSelectedDevice(device);
    setConfigDialogOpen(true);
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter((d) => d.id !== id));
    toast.success('Device deleted');
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

        <Tabs defaultValue="devices" className="space-y-4 sm:space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="devices" className="text-xs sm:text-sm">Devices</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm">Config Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="provisioning">Provisioning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="router">Router</SelectItem>
                  <SelectItem value="access_point">Access Point</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="gateway">Gateway</SelectItem>
                  <SelectItem value="endpoint">Endpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Device Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredDevices.slice(0, 12).map((device, i) => {
                  const statusInfo = statusConfig[device.status];
                  const typeInfo = typeConfig[device.type];
                  const StatusIcon = statusInfo.icon;
                  const TypeIcon = typeInfo.icon;
                  
                  return (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="group hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn('p-2 rounded-lg bg-muted', typeInfo.color)}>
                                <TypeIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{device.name}</CardTitle>
                                <CardDescription>{device.model}</CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline" className={statusInfo.color}>
                              <StatusIcon className={cn('h-3 w-3 mr-1', device.status === 'provisioning' && 'animate-spin')} />
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">IP:</span>
                              <span className="ml-2 font-mono">{device.ip}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">MAC:</span>
                              <span className="ml-2 font-mono text-xs">{device.mac.slice(0, 8)}...</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Firmware:</span>
                              <span className="ml-2">{device.firmware}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2">{device.location || 'N/A'}</span>
                            </div>
                          </div>
                          
                          {device.configCode && (
                            <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                              <Key className="h-4 w-4 text-muted-foreground" />
                              <code className="text-xs font-mono flex-1">{device.configCode}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopyCode(device.configCode!)}
                              >
                                {copiedCode === device.configCode ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleGenerateConfig(device)}
                            >
                              <Code className="h-4 w-4 mr-2" />
                              Generate Config
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleRebootDevice(device.id)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reboot
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Configure
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <QrCode className="h-4 w-4 mr-2" />
                                  Show QR
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteDevice(device.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {filteredDevices.length > 12 && (
              <div className="text-center text-sm text-muted-foreground">
                Showing 12 of {filteredDevices.length} devices
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
      </div>
    </PageTransition>
  );
}
