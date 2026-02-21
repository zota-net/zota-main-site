'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Filter,
  Search,
  Check,
  X,
  Clock,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { useNetworkStore, Alert } from '@/lib/store/network-store';
import { cn } from '@/lib/utils';

const alertTypeConfig = {
  critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  error: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export default function AlertsPage() {
  const { alerts, acknowledgeAlert, resolveAlert, clearAlerts } = useNetworkStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && !alert.resolved) ||
      (activeTab === 'resolved' && alert.resolved);
    return matchesSearch && matchesType && matchesTab;
  });

  const alertCounts = {
    all: alerts.length,
    active: alerts.filter((a) => !a.resolved).length,
    resolved: alerts.filter((a) => a.resolved).length,
    critical: alerts.filter((a) => a.type === 'critical' && !a.resolved).length,
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const toggleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map((a) => a.id));
    }
  };

  const bulkAcknowledge = () => {
    selectedAlerts.forEach((id) => acknowledgeAlert(id));
    setSelectedAlerts([]);
  };

  const bulkResolve = () => {
    selectedAlerts.forEach((id) => resolveAlert(id));
    setSelectedAlerts([]);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Alerts
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage system alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {alertCounts.critical > 0 && (
              <Badge variant="destructive" className="px-3 py-1">
                {alertCounts.critical} Critical
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={clearAlerts}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StaggerContainer className="grid gap-4 md:grid-cols-4">
          <StaggerItem>
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveTab('all')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{alertCounts.all}</p>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveTab('active')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{alertCounts.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveTab('resolved')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{alertCounts.resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setTypeFilter('critical')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{alertCounts.critical}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Filters and Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All ({alertCounts.all})</TabsTrigger>
                  <TabsTrigger value="active">Active ({alertCounts.active})</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved ({alertCounts.resolved})</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedAlerts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedAlerts.length} selected
                    </span>
                    <Button size="sm" variant="outline" onClick={bulkAcknowledge}>
                      <Check className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                    <Button size="sm" variant="outline" onClick={bulkResolve}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <CardTitle className="text-base">Alerts ({filteredAlerts.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">No alerts found</h3>
                  <p className="text-muted-foreground text-sm">All systems operating normally</p>
                </motion.div>
              ) : (
                <div className="divide-y">
                  {filteredAlerts.map((alert, index) => {
                    const config = alertTypeConfig[alert.type];
                    const Icon = config.icon;
                    
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          'flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors',
                          !alert.acknowledged && 'bg-muted/30',
                          alert.resolved && 'opacity-60'
                        )}
                      >
                        <Checkbox
                          checked={selectedAlerts.includes(alert.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAlerts([...selectedAlerts, alert.id]);
                            } else {
                              setSelectedAlerts(selectedAlerts.filter((id) => id !== alert.id));
                            }
                          }}
                        />
                        
                        <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
                          <Icon className={cn('h-4 w-4', config.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn(
                              'font-medium',
                              alert.resolved && 'line-through text-muted-foreground'
                            )}>
                              {alert.title}
                            </p>
                            <Badge variant="outline" className={cn('text-xs capitalize', config.border)}>
                              {alert.type}
                            </Badge>
                            {alert.resolved && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTime(alert.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {!alert.acknowledged && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {!alert.resolved && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
