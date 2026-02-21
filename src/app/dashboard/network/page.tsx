'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Network as NetworkIcon,
  Filter,
  Search,
  RefreshCw,
  Grid3X3,
  List,
  Router,
  Server,
  Laptop,
  Shield,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { useNetworkStore } from '@/lib/store/network-store';
import { cn } from '@/lib/utils';

const nodeTypeIcons = {
  router: Router,
  server: Server,
  switch: NetworkIcon,
  endpoint: Laptop,
  firewall: Shield,
  datacenter: Building2,
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  warning: 'bg-yellow-500',
  critical: 'bg-red-500',
};

const statusBadgeVariants = {
  online: 'bg-green-500/10 text-green-500 border-green-500/20',
  offline: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function NetworkPage() {
  const { nodes, metrics, setSelectedNodes, selectedNodeIds, statusFilter, setStatusFilter } = useNetworkStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || node.type === typeFilter;
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(node.status);
    return matchesSearch && matchesType && matchesStatus;
  });

  const nodesByType = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <NetworkIcon className="h-6 w-6 text-primary" />
              Network Overview
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage {metrics.totalNodes} network nodes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              Add Node
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(nodesByType).map(([type, count]) => {
            const Icon = nodeTypeIcons[type as keyof typeof nodeTypeIcons] || NetworkIcon;
            return (
              <Card key={type} className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setTypeFilter(type)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{type}s</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Node type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="router">Routers</SelectItem>
                    <SelectItem value="server">Servers</SelectItem>
                    <SelectItem value="switch">Switches</SelectItem>
                    <SelectItem value="endpoint">Endpoints</SelectItem>
                    <SelectItem value="firewall">Firewalls</SelectItem>
                    <SelectItem value="datacenter">Data Centers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                  <TabsList className="h-9">
                    <TabsTrigger value="grid" className="px-3">
                      <Grid3X3 className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="list" className="px-3">
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nodes Display */}
        {viewMode === 'grid' ? (
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNodes.map((node, index) => {
              const Icon = nodeTypeIcons[node.type as keyof typeof nodeTypeIcons] || NetworkIcon;
              const trafficPercent = node.traffic * 100;
              
              return (
                <StaggerItem key={node.id}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={cn(
                        'cursor-pointer transition-all duration-200',
                        selectedNodeIds.includes(node.id) && 'ring-2 ring-primary'
                      )}
                      onClick={() => setSelectedNodes([node.id])}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{node.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn('text-xs', statusBadgeVariants[node.status])}
                          >
                            {node.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Traffic Load</span>
                            <span className={cn(
                              trafficPercent > 80 ? 'text-red-500' : 
                              trafficPercent > 60 ? 'text-yellow-500' : 'text-foreground'
                            )}>
                              {trafficPercent.toFixed(0)}%
                            </span>
                          </div>
                          <Progress 
                            value={trafficPercent}
                            className={cn(
                              'h-1.5',
                              trafficPercent > 80 && '[&>div]:bg-red-500',
                              trafficPercent > 60 && trafficPercent <= 80 && '[&>div]:bg-yellow-500'
                            )}
                          />
                          
                          <div className="flex items-center justify-between text-xs pt-2">
                            <span className="text-muted-foreground">Latency</span>
                            <span>{node.latency.toFixed(1)}ms</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Uptime</span>
                            <span className="text-green-500">{node.uptime.toFixed(2)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredNodes.map((node, index) => {
                  const Icon = nodeTypeIcons[node.type as keyof typeof nodeTypeIcons] || NetworkIcon;
                  const trafficPercent = node.traffic * 100;
                  
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        'flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                        selectedNodeIds.includes(node.id) && 'bg-primary/5'
                      )}
                      onClick={() => setSelectedNodes([node.id])}
                    >
                      <div className="p-2 rounded-lg bg-muted shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{node.name}</p>
                          <Badge 
                            variant="outline" 
                            className={cn('text-xs', statusBadgeVariants[node.status])}
                          >
                            {node.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
                      </div>
                      
                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className={cn(
                            'font-medium',
                            trafficPercent > 80 ? 'text-red-500' : 
                            trafficPercent > 60 ? 'text-yellow-500' : ''
                          )}>
                            {trafficPercent.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Traffic</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{node.latency.toFixed(1)}ms</p>
                          <p className="text-xs text-muted-foreground">Latency</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-green-500">{node.uptime.toFixed(2)}%</p>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredNodes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <NetworkIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No nodes found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
