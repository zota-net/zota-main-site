'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNetworkStore } from '@/lib/store/network-store';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

function getAlertIcon(type: string) {
  switch (type) {
    case 'critical':
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    default:
      return Info;
  }
}

function getAlertColor(type: string) {
  switch (type) {
    case 'critical':
      return 'text-red-500 bg-red-500/10';
    case 'error':
      return 'text-destructive bg-destructive/10';
    case 'warning':
      return 'text-yellow-500 bg-yellow-500/10';
    default:
      return 'text-blue-500 bg-blue-500/10';
  }
}

interface AlertsCardProps {
  className?: string;
  maxItems?: number;
}

export function AlertsCard({ className, maxItems = 5 }: AlertsCardProps) {
  const { alerts, acknowledgeAlert } = useNetworkStore();
  const recentAlerts = alerts.filter((a) => !a.resolved).slice(0, maxItems);
  const criticalCount = alerts.filter((a) => a.type === 'critical' && !a.resolved).length;

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Recent Alerts
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {criticalCount} critical
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
            <p className="text-sm">No active alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAlerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type);
              const colorClass = getAlertColor(alert.type);
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => acknowledgeAlert(alert.id)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    'hover:bg-muted/50',
                    !alert.acknowledged && 'bg-muted/30'
                  )}
                >
                  <div className={cn('p-1.5 rounded-md shrink-0', colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {alert.message}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
