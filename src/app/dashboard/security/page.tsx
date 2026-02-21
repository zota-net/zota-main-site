'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Key,
  UserCheck,
  Activity,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCounter } from '@/components/common';
import { cn } from '@/lib/utils';

interface SecurityEvent {
  id: string;
  type: 'blocked' | 'warning' | 'info';
  title: string;
  source: string;
  timestamp: number;
}

const mockEvents: SecurityEvent[] = [
  { id: '1', type: 'blocked', title: 'Suspicious login attempt blocked', source: '185.234.xx.xx', timestamp: Date.now() - 120000 },
  { id: '2', type: 'warning', title: 'Unusual traffic pattern detected', source: 'Node-042', timestamp: Date.now() - 300000 },
  { id: '3', type: 'blocked', title: 'DDoS attempt mitigated', source: 'Multiple sources', timestamp: Date.now() - 600000 },
  { id: '4', type: 'info', title: 'Security scan completed', source: 'System', timestamp: Date.now() - 1800000 },
  { id: '5', type: 'warning', title: 'Certificate expiring soon', source: 'api.domain.com', timestamp: Date.now() - 3600000 },
];

const eventTypeConfig = {
  blocked: { icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  info: { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export default function SecurityPage() {
  const [firewallEnabled, setFirewallEnabled] = useState(true);
  const [intrusionDetection, setIntrusionDetection] = useState(true);
  const [ddosProtection, setDdosProtection] = useState(true);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Security Center
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage network security
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
              <ShieldCheck className="h-4 w-4 mr-1" />
              All Systems Protected
            </Badge>
          </div>
        </div>

        {/* Security Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-500">
                      <AnimatedCounter value={94} />
                    </span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500/20 text-green-500 border-0">Excellent</Badge>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Security Score</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your network security posture is excellent. Keep monitoring for threats.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">247</p>
                  <p className="text-xs text-muted-foreground">Threats Blocked</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Active Incidents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">3</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protection Status */}
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Firewall</p>
                      <p className="text-xs text-muted-foreground">Network protection</p>
                    </div>
                  </div>
                  <Switch checked={firewallEnabled} onCheckedChange={setFirewallEnabled} />
                </div>
                <Progress value={100} className="h-1.5 [&>div]:bg-green-500" />
                <p className="text-xs text-muted-foreground mt-2">All rules active</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Intrusion Detection</p>
                      <p className="text-xs text-muted-foreground">Real-time monitoring</p>
                    </div>
                  </div>
                  <Switch checked={intrusionDetection} onCheckedChange={setIntrusionDetection} />
                </div>
                <Progress value={100} className="h-1.5 [&>div]:bg-green-500" />
                <p className="text-xs text-muted-foreground mt-2">Scanning active</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">DDoS Protection</p>
                      <p className="text-xs text-muted-foreground">Traffic filtering</p>
                    </div>
                  </div>
                  <Switch checked={ddosProtection} onCheckedChange={setDdosProtection} />
                </div>
                <Progress value={100} className="h-1.5 [&>div]:bg-green-500" />
                <p className="text-xs text-muted-foreground mt-2">Protection enabled</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Security Events and Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Events */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Latest security activity and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEvents.map((event, index) => {
                  const config = eventTypeConfig[event.type];
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn('p-2 rounded-lg', config.bg)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">Source: {event.source}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(event.timestamp)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Events</Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common security operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ShieldAlert className="h-4 w-4 mr-2" />
                Run Security Scan
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Key className="h-4 w-4 mr-2" />
                Rotate API Keys
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="h-4 w-4 mr-2" />
                Review Access Logs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-2" />
                Update Firewall Rules
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Regulatory and security compliance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { name: 'SOC 2', status: 'Compliant', progress: 100 },
                { name: 'ISO 27001', status: 'Compliant', progress: 100 },
                { name: 'GDPR', status: 'Compliant', progress: 100 },
                { name: 'PCI DSS', status: 'In Progress', progress: 85 },
              ].map((item) => (
                <div key={item.name} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant={item.progress === 100 ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                  <Progress value={item.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
