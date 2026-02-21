'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bell,
  Moon,
  Sun,
  Menu,
  Settings,
  LogOut,
  User,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { SearchTrigger } from '@/components/global-search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';
import { useNetworkStore, Alert } from '@/lib/store/network-store';
import { useAppStore } from '@/lib/store/app-store';

interface HeaderProps {
  className?: string;
}

function AlertIcon({ type }: { type: Alert['type'] }) {
  switch (type) {
    case 'critical':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

export function AppHeader({ className }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useUserStore();
  const { settings, setSetting } = useAppStore();
  const { alerts, acknowledgeAlert } = useNetworkStore();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const recentAlerts = alerts.slice(0, 10);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleSidebar = () => {
    setSetting('sidebarCollapsed', !settings.sidebarCollapsed);
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const sidebarWidth = settings.sidebarCollapsed ? 72 : 280;
  const headerLeft = mounted && !isMobile ? sidebarWidth : 0;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-14 sm:h-16 border-b border-border bg-background/95 backdrop-blur-xl transition-all duration-300',
        className
      )}
      style={{ left: headerLeft }}
    >
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6 gap-2">
        {/* Left side */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0 lg:hidden h-8 w-8 sm:h-9 sm:w-9"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          {/* Global Search Trigger */}
          <div className="hidden sm:block flex-1 max-w-md">
            <SearchTrigger />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unacknowledgedAlerts.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                  >
                    {unacknowledgedAlerts.length > 9 ? '9+' : unacknowledgedAlerts.length}
                  </motion.span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b p-4">
                <h4 className="font-semibold">Notifications</h4>
                <Badge variant="secondary" className="text-xs">
                  {unacknowledgedAlerts.length} new
                </Badge>
              </div>
              <ScrollArea className="h-80">
                {recentAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mb-2" />
                    <p className="text-sm">All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                          !alert.acknowledged && 'bg-muted/30'
                        )}
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <AlertIcon type={alert.type} />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            alert.acknowledged && 'text-muted-foreground'
                          )}>
                            {alert.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(alert.timestamp)}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="border-t p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setNotificationsOpen(false);
                    router.push('/dashboard/alerts');
                  }}
                >
                  View all alerts
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 gap-2 pl-2 pr-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xs">
                    {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm font-medium">
                  {user?.name || 'User'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
