'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Settings,
  Terminal,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition, StaggerContainer, StaggerItem, PulseIndicator } from '@/components/common';
import { useNetworkStore } from '@/lib/store/network-store';
import { cn } from '@/lib/utils';

interface ControlAction {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastRun?: number;
  enabled: boolean;
}

const initialActions: ControlAction[] = [
  { id: 'auto-scale', name: 'Auto Scaling', description: 'Automatically scale resources based on demand', status: 'idle', enabled: true },
  { id: 'load-balance', name: 'Load Balancing', description: 'Distribute traffic across nodes', status: 'running', enabled: true, lastRun: Date.now() - 30000 },
  { id: 'failover', name: 'Auto Failover', description: 'Automatic failover on node failure', status: 'idle', enabled: true },
  { id: 'backup', name: 'Backup & Sync', description: 'Continuous data backup and synchronization', status: 'success', enabled: true, lastRun: Date.now() - 3600000 },
  { id: 'optimization', name: 'Route Optimization', description: 'AI-powered route optimization', status: 'idle', enabled: false },
  { id: 'security-scan', name: 'Security Scan', description: 'Continuous security vulnerability scanning', status: 'error', enabled: true, lastRun: Date.now() - 7200000 },
];

const statusIcons = {
  idle: Clock,
  running: Play,
  success: CheckCircle2,
  error: XCircle,
};

const statusColors = {
  idle: 'text-muted-foreground',
  running: 'text-blue-500',
  success: 'text-green-500',
  error: 'text-red-500',
};

export default function ControlCenterPage() {
  const { isSimulating, setSimulating, simulationSpeed, setSimulationSpeed, metrics } = useNetworkStore();
  const [actions, setActions] = useState<ControlAction[]>(initialActions);
  const [selectedTab, setSelectedTab] = useState('automation');

  const toggleAction = (id: string) => {
    setActions(actions.map((action) =>
      action.id === id ? { ...action, enabled: !action.enabled } : action
    ));
  };

  const runAction = (id: string) => {
    setActions(actions.map((action) =>
      action.id === id ? { ...action, status: 'running', lastRun: Date.now() } : action
    ));
    
    // Simulate completion
    setTimeout(() => {
      setActions(prev => prev.map((action) =>
        action.id === id ? { ...action, status: Math.random() > 0.1 ? 'success' : 'error' } : action
      ));
    }, 2000 + Math.random() * 3000);
  };

  const formatLastRun = (timestamp?: number) => {
    if (!timestamp) return 'Never';
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
              <Radio className="h-6 w-6 text-primary" />
              Control Center
            </h1>
            <p className="text-muted-foreground">
              Manage automation, deployments, and system controls
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <PulseIndicator color={isSimulating ? 'bg-green-500' : 'bg-gray-500'} />
              <span className="text-sm font-medium">
                {isSimulating ? 'Live' : 'Paused'}
              </span>
            </div>
            <Button
              variant={isSimulating ? 'destructive' : 'default'}
              size="sm"
              onClick={() => setSimulating(!isSimulating)}
            >
              {isSimulating ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>

        {/* System Status */}
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="font-medium">System Load</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    Normal
                  </Badge>
                </div>
                <Progress value={67} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">67% capacity utilized</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium">Security Status</span>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    Protected
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Threats blocked:</span>
                    <span className="font-medium ml-1">247</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last scan:</span>
                    <span className="font-medium ml-1">2h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    <span className="font-medium">Active Operations</span>
                  </div>
                  <Badge>
                    {actions.filter(a => a.status === 'running').length} running
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-medium ml-1 text-green-500">1,247</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failed:</span>
                    <span className="font-medium ml-1 text-red-500">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="rules">Rules Engine</TabsTrigger>
          </TabsList>

          <TabsContent value="automation" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Automation Rules</CardTitle>
                <CardDescription>
                  Configure and manage automated system operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actions.map((action, index) => {
                    const StatusIcon = statusIcons[action.status];
                    
                    return (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border',
                          action.enabled ? 'bg-card' : 'bg-muted/30'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'p-2 rounded-lg',
                            action.enabled ? 'bg-primary/10' : 'bg-muted'
                          )}>
                            <Settings className={cn(
                              'h-5 w-5',
                              action.enabled ? 'text-primary' : 'text-muted-foreground'
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{action.name}</p>
                              <StatusIcon className={cn('h-4 w-4', statusColors[action.status])} />
                            </div>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                            {action.lastRun && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last run: {formatLastRun(action.lastRun)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!action.enabled || action.status === 'running'}
                            onClick={() => runAction(action.id)}
                          >
                            {action.status === 'running' ? (
                              <>
                                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Running
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-2" />
                                Run Now
                              </>
                            )}
                          </Button>
                          <Switch
                            checked={action.enabled}
                            onCheckedChange={() => toggleAction(action.id)}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployments" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Queue</CardTitle>
                <CardDescription>
                  Manage and monitor configuration deployments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <RotateCcw className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium">No pending deployments</h3>
                  <p className="text-sm">Create a new deployment to get started</p>
                  <Button className="mt-4">Create Deployment</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Rules Engine</CardTitle>
                <CardDescription>
                  Define conditional automation rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">High Traffic Alert</p>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      IF traffic {'>'} 80% THEN scale_up AND notify_admin
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Node Failure Response</p>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      IF node.status = offline THEN failover_to_backup AND log_incident
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Security Threat Response</p>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      IF threat_detected THEN block_ip AND escalate_to_security
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    + Add New Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
