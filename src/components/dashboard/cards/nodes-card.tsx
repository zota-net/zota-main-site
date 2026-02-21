'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNetworkStore } from '@/lib/store/network-store';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Router, 
  Server, 
  Laptop, 
  Shield, 
  Building2,
  Network,
} from 'lucide-react';

const nodeTypeIcons = {
  router: Router,
  server: Server,
  switch: Network,
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

interface NodesCardProps {
  className?: string;
  maxItems?: number;
}

export function NodesCard({ className, maxItems = 8 }: NodesCardProps) {
  const { nodes, setSelectedNodes } = useNetworkStore();
  
  // Group nodes by status
  const statusCounts = nodes.reduce((acc, node) => {
    acc[node.status] = (acc[node.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get highest traffic nodes
  const topNodes = [...nodes]
    .sort((a, b) => b.traffic - a.traffic)
    .slice(0, maxItems);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Network Nodes</CardTitle>
        <div className="flex items-center gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Badge
              key={status}
              variant="outline"
              className="text-xs gap-1"
            >
              <span className={cn('h-2 w-2 rounded-full', statusColors[status as keyof typeof statusColors])} />
              {count}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topNodes.map((node, index) => {
            const Icon = nodeTypeIcons[node.type];
            const trafficPercent = node.traffic * 100;
            
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedNodes([node.id])}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-md bg-muted shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium truncate">{node.name}</span>
                    <span className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      statusColors[node.status]
                    )} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={trafficPercent} 
                      className={cn(
                        'h-1.5 flex-1',
                        trafficPercent > 80 && '[&>div]:bg-red-500',
                        trafficPercent > 60 && trafficPercent <= 80 && '[&>div]:bg-yellow-500'
                      )}
                    />
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {trafficPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
