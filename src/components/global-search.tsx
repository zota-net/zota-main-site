'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Search,
  ArrowRight,
  CornerDownLeft,
  Ticket,
  Users,
  Smartphone,
  CreditCard,
  Router,
  AlertTriangle,
  LayoutDashboard,
  Network,
  BarChart3,
  Sliders,
  Shield,
  Bell,
  Settings,
  Plus,
  UserPlus,
  Download,
  SunMoon,
  Command,
  Loader2,
  Clock,
  X,
  Headphones,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSearchStore, type SearchResult } from '@/lib/store/search-store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  'ticket': Ticket,
  'user': Users,
  'users': Users,
  'router': Router,
  'smartphone': Smartphone,
  'server': Router,
  'wifi': Network,
  'credit-card': CreditCard,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertTriangle,
  'layout-dashboard': LayoutDashboard,
  'network': Network,
  'bar-chart': BarChart3,
  'sliders': Sliders,
  'shield': Shield,
  'bell': Bell,
  'settings': Settings,
  'plus': Plus,
  'user-plus': UserPlus,
  'download': Download,
  'sun-moon': SunMoon,
  'headphones': Headphones,
};

// Category labels and colors
const categoryConfig: Record<string, { label: string; color: string }> = {
  navigation: { label: 'Navigation', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  management: { label: 'Management', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  action: { label: 'Action', color: 'bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]/20' },
  voucher: { label: 'Voucher', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  user: { label: 'User', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  device: { label: 'Device', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  payment: { label: 'Payment', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  network: { label: 'Network', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  alert: { label: 'Alert', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

function ResultIcon({ icon, className }: { icon?: string; className?: string }) {
  const IconComponent = icon ? (iconMap[icon] || Search) : Search;
  return React.createElement(IconComponent, { className });
}

function SearchResultItem({
  result,
  isSelected,
  onSelect,
}: {
  result: SearchResult;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const category = categoryConfig[result.category] || categoryConfig.navigation;

  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
        isSelected
          ? 'bg-[#FF6A00]/10 border border-[#FF6A00]/30'
          : 'hover:bg-muted/50 border border-transparent'
      )}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
    >
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
          isSelected ? 'bg-[#FF6A00]/20' : 'bg-muted'
        )}
      >
        <ResultIcon
          icon={result.icon}
          className={cn('h-4 w-4', isSelected ? 'text-[#FF6A00]' : 'text-muted-foreground')}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-medium truncate', isSelected && 'text-[#FF6A00]')}>
            {result.title}
          </span>
          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4', category.color)}>
            {category.label}
          </Badge>
        </div>
        {result.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{result.description}</p>
        )}
      </div>
      {isSelected && (
        <div className="flex-shrink-0 flex items-center gap-1 text-[#FF6A00]">
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </motion.button>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const {
    isOpen,
    setOpen,
    query,
    setQuery,
    results,
    search,
    isLoading,
    selectedIndex,
    setSelectedIndex,
    recentSearches,
    addRecentSearch,
    clearResults,
  } = useSearchStore();

  // Keyboard shortcut to open search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Debounced search
  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        search(value);
      }, 150);
    },
    [setQuery, search]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(selectedIndex + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(selectedIndex - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [selectedIndex, setSelectedIndex, results, setOpen]
  );

  // Handle result selection
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      if (query) {
        addRecentSearch(query);
      }

      if (result.path) {
        router.push(result.path);
        setOpen(false);
        clearResults();
      } else if (result.action) {
        // Handle actions
        switch (result.action) {
          case 'toggle-theme':
            setTheme(theme === 'dark' ? 'light' : 'dark');
            break;
          case 'create-voucher':
            router.push('/dashboard/vouchers?action=create');
            break;
          case 'add-device':
            router.push('/dashboard/devices?action=create');
            break;
          case 'add-user':
            router.push('/dashboard/users?action=create');
            break;
          case 'new-ticket':
            router.push('/dashboard/support?action=create');
            break;
          case 'export':
            // Trigger export functionality
            break;
        }
        setOpen(false);
        clearResults();
      }
    },
    [router, setOpen, clearResults, addRecentSearch, query, setTheme, theme]
  );

  // Group results by category
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    const group = result.category === 'navigation' || result.category === 'management' 
      ? 'pages' 
      : result.category === 'action' 
        ? 'actions' 
        : 'results';
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(result);
    return acc;
  }, {});

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Global Search</DialogTitle>
        </VisuallyHidden>
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b px-4 py-4 bg-muted/30">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#FF6A00]/10 shrink-0">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-[#FF6A00] animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-[#FF6A00]" />
            )}
          </div>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, vouchers, users, devices..."
              className="h-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base font-medium placeholder:text-muted-foreground/60 placeholder:font-normal"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  search('');
                }}
                className="h-7 w-7 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                title="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-7 select-none items-center gap-1 rounded-md border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            <AnimatePresence mode="wait">
              {results.length === 0 && query ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center text-muted-foreground"
                >
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No results found for &quot;{query}&quot;</p>
                  <p className="text-xs mt-1">Try searching for pages, vouchers, users, or devices</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Recent Searches */}
                  {!query && recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-2 mb-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Recent
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => {
                              setQuery(term);
                              search(term);
                            }}
                            className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pages */}
                  {groupedResults.pages && groupedResults.pages.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                        Pages
                      </p>
                      <div className="space-y-1">
                        {groupedResults.pages.map((result, index) => (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            isSelected={results.indexOf(result) === selectedIndex}
                            onSelect={() => handleSelectResult(result)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {groupedResults.actions && groupedResults.actions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                        Quick Actions
                      </p>
                      <div className="space-y-1">
                        {groupedResults.actions.map((result, index) => (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            isSelected={results.indexOf(result) === selectedIndex}
                            onSelect={() => handleSelectResult(result)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Results */}
                  {groupedResults.results && groupedResults.results.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                        Results
                      </p>
                      <div className="space-y-1">
                        {groupedResults.results.map((result, index) => (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            isSelected={results.indexOf(result) === selectedIndex}
                            onSelect={() => handleSelectResult(result)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] font-mono">↓</kbd>
              <span className="ml-1">Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] font-mono flex items-center gap-0.5">
                <CornerDownLeft className="h-2.5 w-2.5" />
              </kbd>
              <span className="ml-1">Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] font-mono">Esc</kbd>
              <span className="ml-1">Close</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-[#FF6A00]">Typesense</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export the SearchTrigger button for use in header
export function SearchTrigger({ className }: { className?: string }) {
  const { setOpen } = useSearchStore();

  return (
    <button
      onClick={() => setOpen(true)}
      className={cn(
        'flex items-center gap-2 h-9 w-full max-w-[250px] px-3 rounded-md border border-input bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors',
        className
      )}
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
        <Command className="h-3 w-3" />K
      </kbd>
    </button>
  );
}
