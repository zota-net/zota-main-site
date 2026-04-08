'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Network,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  Users,
  FileText,
  HelpCircle,
  ChevronLeft,
  Ticket,
  Smartphone,
  CreditCard,
  Headphones,
  X,
  UserCheck,
  Package,
  Activity,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/components/common';
import { useAppStore } from '@/lib/store/app-store';
import { Badge } from '@/components/ui/badge';
import { useNetworkStore } from '@/lib/store/network-store';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { title: 'My Activities', href: '/dashboard/agent-dashboard', icon: Activity },
      // { title: 'Network', href: '/dashboard/network', icon: Network },
      // { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 }
    ],
  },
  {
    title: 'Management',
    items: [
      { title: 'Vouchers', href: '/dashboard/vouchers', icon: Ticket },
      { title: 'Packages', href: '/dashboard/packages', icon: Package },
      { title: 'Adverts', href: '/dashboard/adverts', icon: Megaphone },
      { title: 'Agents', href: '/dashboard/agents', icon: UserCheck },
      { title: 'Devices', href: '/dashboard/devices', icon: Smartphone },
      { title: 'Users', href: '/dashboard/users', icon: Users },
      { title: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Support & Help', href: '/dashboard/support', icon: Headphones },
      // { title: 'Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
      { title: 'Security', href: '/dashboard/security', icon: Shield },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Reports', href: '/dashboard/reports', icon: FileText },
      { title: 'Settings', href: '/dashboard/settings', icon: Settings },
      // { title: 'Help', href: '/dashboard/help', icon: HelpCircle },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { settings, setSetting } = useAppStore();
  const { alerts } = useNetworkStore();
  const collapsed = settings.sidebarCollapsed;
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Count unacknowledged alerts
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSetting('sidebarCollapsed', !collapsed);
    }
  };

  // For mobile: show/hide based on mobileOpen state
  // For desktop: always visible
  const isVisible = isMobile ? mobileOpen : true;
  const sidebarWidth = isMobile ? 280 : (collapsed ? 72 : 280);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden cursor-pointer"
            aria-label="Close menu"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          x: isMobile ? (mobileOpen ? 0 : -280) : 0,
          width: sidebarWidth 
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r border-border bg-card/95 backdrop-blur-xl',
          isMobile && !mobileOpen && '-translate-x-full',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              className="flex items-center"
            >
              <Logo 
                size={collapsed ? 'sm' : 'md'} 
                showText={!collapsed}
                variant={collapsed ? 'icon' : 'full'}
              />
            </motion.div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-8 w-8 shrink-0"
            >
              <motion.div
                initial={false}
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 h-[calc(100vh-280px)] px-3 py-4 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-border/80">
            <nav className="space-y-6 pr-4">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  {!collapsed && (
                    <motion.h4
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {group.title}
                    </motion.h4>
                  )}
                  
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    
                    // Add dynamic badge for alerts
                    let badge = item.badge;
                    if (item.href === '/dashboard/alerts' && unacknowledgedAlerts > 0) {
                      badge = unacknowledgedAlerts;
                    }

                    const NavLink = (
                      <Link
                        href={item.href}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          'hover:bg-accent/50 active:bg-accent/70',
                          'cursor-pointer select-none',
                          'touch-highlight-transparent',
                          isActive
                            ? 'bg-primary/10 text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                          collapsed && 'justify-center px-0',
                          // Mobile/tablet improvements
                          'md:py-2.5 sm:py-3 min-h-[2.75rem] sm:min-h-[2.75rem]'
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        
                        <item.icon className={cn(
                          'h-5 w-5 shrink-0 transition-transform duration-200',
                          'group-hover:scale-110 group-active:scale-95',
                          isActive && 'text-primary'
                        )} />
                        
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1"
                          >
                            {item.title}
                          </motion.span>
                        )}
                        
                        {!collapsed && badge && (
                          <Badge
                            variant={item.badgeVariant || (item.href === '/dashboard/alerts' ? 'destructive' : 'secondary')}
                            className="h-5 min-w-5 px-1.5 text-xs"
                          >
                            {badge}
                          </Badge>
                        )}
                        
                        {collapsed && badge && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                            {typeof badge === 'number' && badge > 9 ? '9+' : badge}
                          </span>
                        )}
                      </Link>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            {NavLink}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            {item.title}
                            {badge && (
                              <Badge variant="secondary" className="h-5 text-xs">
                                {badge}
                              </Badge>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.href}>{NavLink}</div>;
                  })}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border p-4">
            {!collapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>v1.0.0</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Connected
                </span>
              </motion.div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">System Online</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
