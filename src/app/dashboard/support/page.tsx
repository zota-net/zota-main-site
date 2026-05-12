'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  MoreHorizontal,
  Paperclip,
  Smile,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Users,
  Headphones,
  ArrowLeft,
  Star,
  RefreshCw,
  Download,
  Tag,
  ChevronDown,
  Inbox,
  Archive,
  Trash2,
  TicketIcon,
  MessageCircle,
  Bot,
  Zap,
  Settings,
  FileText,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { PageTransition } from '@/components/common';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/user-store';
import { supportService } from '@/lib/api/services/base-operations';
import type { SupportTicket } from '@/lib/api/types';

// ─── Local display types ──────────────────────────────────────────────────────

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'system' | 'bot';
  senderName: string;
  senderAvatar?: string;
  timestamp: number;
  read: boolean;
}

interface Ticket {
  id: string; // string form of numeric API id
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: number;
  updatedAt: number;
  assignedTo?: { id: string; name: string };
  customer: { id: string; name: string; email: string };
  messages: Message[];
  tags: string[];
}

interface StaticAgent {
  id: string;
  name: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  activeChats: number;
  department: string;
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalizeTicket(t: SupportTicket, userName: string, userEmail: string): Ticket {
  return {
    id: String(t.id),
    subject: t.subject,
    description: t.description,
    status: t.status,
    priority: t.priority,
    category: t.category,
    createdAt: new Date(t.createdAt).getTime(),
    updatedAt: new Date(t.updatedAt).getTime(),
    assignedTo: t.assignedTo ? { id: '', name: t.assignedTo } : undefined,
    customer: { id: String(t.clientId), name: userName, email: userEmail },
    messages: (t.messages ?? []).map((m) => ({
      id: m.id,
      content: m.content,
      sender: m.sender as Message['sender'],
      senderName: m.senderName,
      timestamp: m.timestamp,
      read: m.read,
    })),
    tags: [],
  };
}

// ─── Configs ──────────────────────────────────────────────────────────────────

const statusConfig = {
  open: { label: 'Open', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Inbox },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  waiting: { label: 'Waiting', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: XCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  medium: { label: 'Medium', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  high: { label: 'High', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

const agentStatusConfig = {
  online: { label: 'Online', color: 'bg-green-500' },
  busy: { label: 'Busy', color: 'bg-yellow-500' },
  away: { label: 'Away', color: 'bg-orange-500' },
  offline: { label: 'Offline', color: 'bg-gray-400' },
};

// Static placeholder agents (no dedicated agents endpoint yet)
const STATIC_AGENTS: StaticAgent[] = [
  { id: 'agent-1', name: 'Support Team', status: 'online', activeChats: 0, department: 'General' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const { user } = useUserStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');
  const [mainTab, setMainTab] = useState('support');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'Technical',
    priority: 'medium' as Ticket['priority'],
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'operator';
  const clientId = user?.client_id;

  const fetchTickets = useCallback(async () => {
    if (!clientId) return;
    setIsLoadingTickets(true);
    try {
      const res = await supportService.getByClient(clientId, { limit: 50 });
      const raw: SupportTicket[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res as unknown as SupportTicket[] : [];
      setTickets(raw.map((t) => normalizeTicket(t, user?.name ?? 'User', user?.email ?? '')));
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setIsLoadingTickets(false);
    }
  }, [clientId, user?.name, user?.email]);

  useEffect(() => {
    fetchTickets();
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [fetchTickets]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in-progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  }), [tickets]);

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!clientId) return;

    setIsCreatingTicket(true);
    try {
      const created = await supportService.createTicket({
        clientId,
        subject: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
      });
      const normalized = normalizeTicket(created, user?.name ?? 'User', user?.email ?? '');
      setTickets((prev) => [normalized, ...prev]);
      setSelectedTicket(normalized);
      setCreateDialogOpen(false);
      setNewTicket({ subject: '', description: '', category: 'Technical', priority: 'medium' });
      toast.success('Ticket created successfully');
    } catch {
      toast.error('Failed to create ticket');
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    const sender: 'user' | 'agent' = isAdmin ? 'agent' : 'user';
    const senderName = user?.name || 'You';

    setIsSendingMessage(true);
    try {
      const updated = await supportService.addMessage(selectedTicket.id, newMessage, senderName, sender);
      const normalized = normalizeTicket(updated, user?.name ?? 'User', user?.email ?? '');
      setTickets((prev) => prev.map((t) => t.id === selectedTicket.id ? normalized : t));
      setSelectedTicket(normalized);
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: Ticket['status']) => {
    try {
      const updated = await supportService.updateStatus(ticketId, status);
      const normalized = normalizeTicket(updated, user?.name ?? 'User', user?.email ?? '');
      setTickets((prev) => prev.map((t) => t.id === ticketId ? normalized : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket(normalized);
      toast.success(`Status updated to ${statusConfig[status].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return format(new Date(timestamp), 'MMM d, yyyy');
  };

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Headphones className="h-7 w-7 sm:h-8 sm:w-8 text-[#FF6A00]" />
              Support Center
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {isAdmin ? 'Manage support tickets and client chats' : 'Get help from our support team'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={fetchTickets} disabled={isLoadingTickets}>
              <RefreshCw className={cn('h-4 w-4', isLoadingTickets && 'animate-spin')} />
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Describe your issue and we&apos;ll get back to you as soon as possible.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newTicket.category}
                        onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
                          <SelectItem value="Account">Account</SelectItem>
                          <SelectItem value="Network">Network</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={newTicket.priority}
                        onValueChange={(v) => setNewTicket({ ...newTicket, priority: v as Ticket['priority'] })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide as much detail as possible..."
                      rows={5}
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleCreateTicket}
                    disabled={isCreatingTicket}
                    className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white"
                  >
                    {isCreatingTicket ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Ticket'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="support">Support Tickets</TabsTrigger>
            <TabsTrigger value="help">Help & Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="support" className="space-y-4">
            {/* Stats — Admin Only */}
            {isAdmin && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total', value: stats.total, color: 'text-blue-500', bg: 'bg-blue-500/10', Icon: TicketIcon },
                  { label: 'Open', value: stats.open, color: 'text-yellow-500', bg: 'bg-yellow-500/10', Icon: Inbox },
                  { label: 'In Progress', value: stats.inProgress, color: 'text-purple-500', bg: 'bg-purple-500/10', Icon: Clock },
                  { label: 'Resolved', value: stats.resolved, color: 'text-green-500', bg: 'bg-green-500/10', Icon: CheckCircle2 },
                ].map(({ label, value, color, bg, Icon }) => (
                  <Card key={label}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', bg)}>
                          <Icon className={cn('h-5 w-5', color)} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{value}</p>
                          <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Ticket List */}
              <Card className={cn('lg:col-span-4 flex flex-col h-[500px] lg:h-[600px]', selectedTicket && isMobile && 'hidden')}>
                <CardHeader className="pb-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Tickets</CardTitle>
                    {isAdmin && (
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                        <TabsList className="h-8">
                          <TabsTrigger value="tickets" className="text-xs px-2">All</TabsTrigger>
                          <TabsTrigger value="mine" className="text-xs px-2">Mine</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    )}
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Priority" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  {isLoadingTickets ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      <div className="divide-y">
                        {filteredTickets.map((ticket) => {
                          const statusInfo = statusConfig[ticket.status];
                          const priorityInfo = priorityConfig[ticket.priority];
                          const StatusIcon = statusInfo.icon;
                          const unreadCount = ticket.messages.filter((m) => !m.read && m.sender !== 'user').length;

                          return (
                            <motion.button
                              key={ticket.id}
                              onClick={() => setSelectedTicket(ticket)}
                              className={cn(
                                'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                                selectedTicket?.id === ticket.id && 'bg-muted/50 border-l-2 border-[#FF6A00]'
                              )}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-9 w-9 shrink-0">
                                  <AvatarFallback className="text-xs">
                                    {ticket.customer.name.split(' ').map((n) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm truncate">{ticket.subject}</span>
                                    {unreadCount > 0 && (
                                      <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-[#FF6A00]">
                                        {unreadCount}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">{ticket.category}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', statusInfo.color)}>
                                      {statusInfo.label}
                                    </Badge>
                                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priorityInfo.color)}>
                                      {priorityInfo.label}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground ml-auto">
                                      {formatTime(ticket.updatedAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                        {filteredTickets.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground">
                            <TicketIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No tickets found</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => setCreateDialogOpen(true)}
                            >
                              Create your first ticket
                            </Button>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Chat / Detail View */}
              <Card className={cn('lg:col-span-8 flex flex-col h-[500px] lg:h-[600px]', !selectedTicket && isMobile && 'hidden')}>
                {selectedTicket ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="pb-3 shrink-0 border-b">
                      <div className="flex items-center gap-3">
                        {isMobile && (
                          <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="shrink-0">
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                        )}
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {selectedTicket.customer.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{selectedTicket.subject}</h3>
                            <Badge variant="outline" className={cn('text-xs shrink-0', statusConfig[selectedTicket.status].color)}>
                              {statusConfig[selectedTicket.status].label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>#{selectedTicket.id}</span>
                            <span>•</span>
                            <span>{selectedTicket.category}</span>
                            {selectedTicket.assignedTo && (
                              <>
                                <span>•</span>
                                <span>Assigned to {selectedTicket.assignedTo.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                  <Tag className="h-4 w-4 mr-1" />
                                  Status
                                  <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {Object.entries(statusConfig).map(([key, config]) => (
                                  <DropdownMenuItem
                                    key={key}
                                    onClick={() => handleUpdateStatus(selectedTicket.id, key as Ticket['status'])}
                                  >
                                    <config.icon className="h-4 w-4 mr-2" />
                                    {config.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export Chat
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')} className="text-destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Close Ticket
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="flex-1 p-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                          {selectedTicket.messages.map((message) => {
                            const isOwn = (isAdmin && message.sender === 'agent') || (!isAdmin && message.sender === 'user');

                            return (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                              >
                                <Avatar className="h-8 w-8 shrink-0">
                                  {message.sender === 'system' ? (
                                    <AvatarFallback className="bg-muted">
                                      <Settings className="h-4 w-4" />
                                    </AvatarFallback>
                                  ) : (
                                    <AvatarFallback className="text-xs">
                                      {message.senderName.split(' ').map((n) => n[0]).join('')}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className={cn('max-w-[70%] space-y-1', isOwn && 'items-end')}>
                                  <div className={cn('flex items-center gap-2', isOwn && 'flex-row-reverse')}>
                                    <span className="text-xs font-medium">{message.senderName}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {format(new Date(message.timestamp), 'h:mm a')}
                                    </span>
                                  </div>
                                  <div className={cn(
                                    'rounded-2xl px-4 py-2.5',
                                    isOwn
                                      ? 'bg-[#FF6A00] text-white rounded-tr-sm'
                                      : 'bg-muted rounded-tl-sm'
                                  )}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                    </CardContent>

                    {/* Message Input */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="p-4 border-t shrink-0">
                        <div className="flex items-end gap-2">
                          <div className="flex-1 relative">
                            <Textarea
                              placeholder="Type your message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              className="min-h-[44px] max-h-32 resize-none"
                              rows={1}
                              disabled={isSendingMessage}
                            />
                          </div>
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || isSendingMessage}
                            className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white shrink-0"
                          >
                            {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Press Enter to send, Shift+Enter for new line
                        </p>
                      </div>
                    )}
                    {selectedTicket.status === 'closed' && (
                      <div className="p-4 border-t shrink-0 text-center text-sm text-muted-foreground">
                        This ticket is closed. Create a new ticket if you need further assistance.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                    <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <MessageSquare className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Select a Ticket</h3>
                    <p className="text-sm text-center max-w-sm">
                      Choose a ticket from the list to view the conversation.
                    </p>
                    <Button
                      onClick={() => setCreateDialogOpen(true)}
                      className="mt-4 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Ticket
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Help & Educational Videos
                  </CardTitle>
                  <CardDescription>
                    Learn how to configure and integrate the Zota system with step-by-step video tutorials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      { title: 'Getting Started with Zota', desc: 'Complete setup guide for new installations' },
                      { title: 'Router Configuration', desc: 'How to configure MikroTik routers for hotspot management' },
                      { title: 'Payment Integration', desc: 'Setting up mobile money payments and wallet management' },
                      { title: 'Voucher Management', desc: 'Creating and managing voucher codes for your customers' },
                      { title: 'Analytics & Reporting', desc: 'Understanding your network performance and revenue metrics' },
                      { title: 'Troubleshooting Common Issues', desc: 'Solutions for the most frequently encountered problems' },
                    ].map(({ title, desc }) => (
                      <div key={title} className="space-y-3">
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <iframe
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                            title={title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{title}</h4>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>Additional resources and documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    <a href="/api-documentation" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">API Documentation</p>
                        <p className="text-sm text-muted-foreground">Complete API reference</p>
                      </div>
                    </a>
                    <a href="/faq" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">FAQ</p>
                        <p className="text-sm text-muted-foreground">Frequently asked questions</p>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
