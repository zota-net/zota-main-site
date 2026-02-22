'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Users,
  Headphones,
  Filter,
  ArrowLeft,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Tag,
  ChevronDown,
  Circle,
  Inbox,
  Archive,
  Trash2,
  TicketIcon,
  MessageCircle,
  Bot,
  Zap,
  Shield,
  Settings,
  PanelLeftClose,
  PanelLeft,
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { PageTransition } from '@/components/common';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/user-store';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'system' | 'bot';
  senderName: string;
  senderAvatar?: string;
  timestamp: number;
  read: boolean;
  attachments?: { name: string; type: string; size: string }[];
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: number;
  updatedAt: number;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  messages: Message[];
  tags: string[];
  rating?: number;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  activeChats: number;
  department: string;
}

// Mock data generators
const generateTickets = (): Ticket[] => {
  const subjects = [
    'Cannot connect to VPN',
    'Slow internet speed',
    'Billing inquiry',
    'Password reset request',
    'Router configuration help',
    'Service outage in my area',
    'Upgrade subscription plan',
    'Voucher not working',
    'Device not connecting',
    'Request for refund',
  ];

  const categories = ['Technical', 'Billing', 'Account', 'Network', 'General'];
  const statuses: Ticket['status'][] = ['open', 'in-progress', 'waiting', 'resolved', 'closed'];
  const priorities: Ticket['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const tags = ['vpn', 'billing', 'network', 'router', 'speed', 'outage', 'account'];

  const agents: Agent[] = [
    { id: 'agent-1', name: 'Sarah Chen', email: 'sarah@XETIHUB.com', status: 'online', activeChats: 3, department: 'Technical' },
    { id: 'agent-2', name: 'Mike Johnson', email: 'mike@XETIHUB.com', status: 'online', activeChats: 2, department: 'Billing' },
    { id: 'agent-3', name: 'Emily Davis', email: 'emily@XETIHUB.com', status: 'busy', activeChats: 5, department: 'Technical' },
  ];

  const customers = [
    { id: 'cust-1', name: 'John Smith', email: 'john@example.com' },
    { id: 'cust-2', name: 'Jane Doe', email: 'jane@example.com' },
    { id: 'cust-3', name: 'Bob Wilson', email: 'bob@example.com' },
    { id: 'cust-4', name: 'Alice Brown', email: 'alice@example.com' },
    { id: 'cust-5', name: 'Charlie Lee', email: 'charlie@example.com' },
  ];

  return Array.from({ length: 15 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const agent = Math.random() > 0.3 ? agents[Math.floor(Math.random() * agents.length)] : undefined;
    const createdAt = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000;

    const messages: Message[] = [
      {
        id: `msg-${i}-1`,
        content: `Hi, I need help with ${subjects[i % subjects.length].toLowerCase()}. Can someone assist me?`,
        sender: 'user',
        senderName: customer.name,
        timestamp: createdAt,
        read: true,
      },
      {
        id: `msg-${i}-2`,
        content: 'Hello! Thank you for reaching out. I\'d be happy to help you with this issue. Could you please provide more details?',
        sender: 'agent',
        senderName: agent?.name || 'Support Team',
        timestamp: createdAt + 300000,
        read: true,
      },
    ];

    if (Math.random() > 0.5) {
      messages.push({
        id: `msg-${i}-3`,
        content: 'Sure, here are the details: I\'ve been experiencing this issue since yesterday. I\'ve tried restarting my device but it didn\'t help.',
        sender: 'user',
        senderName: customer.name,
        timestamp: createdAt + 600000,
        read: status !== 'open',
      });
    }

    return {
      id: `TKT-${String(1000 + i).padStart(4, '0')}`,
      subject: subjects[i % subjects.length],
      description: `Detailed description of the issue regarding ${subjects[i % subjects.length].toLowerCase()}.`,
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      createdAt,
      updatedAt: createdAt + Math.random() * 3600000,
      assignedTo: agent ? { id: agent.id, name: agent.name, avatar: agent.avatar } : undefined,
      customer,
      messages,
      tags: [tags[Math.floor(Math.random() * tags.length)], tags[Math.floor(Math.random() * tags.length)]].filter((v, i, a) => a.indexOf(v) === i),
    };
  }).sort((a, b) => b.updatedAt - a.updatedAt);
};

const generateAgents = (): Agent[] => [
  { id: 'agent-1', name: 'Sarah Chen', email: 'sarah@XETIHUB.com', status: 'online', activeChats: 3, department: 'Technical' },
  { id: 'agent-2', name: 'Mike Johnson', email: 'mike@XETIHUB.com', status: 'online', activeChats: 2, department: 'Billing' },
  { id: 'agent-3', name: 'Emily Davis', email: 'emily@XETIHUB.com', status: 'busy', activeChats: 5, department: 'Technical' },
  { id: 'agent-4', name: 'David Kim', email: 'david@XETIHUB.com', status: 'away', activeChats: 0, department: 'Network' },
  { id: 'agent-5', name: 'Lisa Wang', email: 'lisa@XETIHUB.com', status: 'offline', activeChats: 0, department: 'General' },
];

// Status and priority configs
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

export default function SupportPage() {
  const { user } = useUserStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'Technical',
    priority: 'medium' as Ticket['priority'],
  });

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    setTickets(generateTickets());
    setAgents(generateAgents());
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in-progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    avgResponseTime: '2.5 mins',
    satisfaction: '94%',
  }), [tickets]);

  // Handlers
  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const ticket: Ticket = {
      id: `TKT-${String(2000 + tickets.length).padStart(4, '0')}`,
      subject: newTicket.subject,
      description: newTicket.description,
      status: 'open',
      priority: newTicket.priority,
      category: newTicket.category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      customer: {
        id: user?.id || 'user-1',
        name: user?.name || 'Current User',
        email: user?.email || 'user@example.com',
      },
      messages: [
        {
          id: `msg-new-1`,
          content: newTicket.description,
          sender: 'user',
          senderName: user?.name || 'Current User',
          timestamp: Date.now(),
          read: false,
        },
      ],
      tags: [],
    };

    setTickets((prev) => [ticket, ...prev]);
    setCreateDialogOpen(false);
    setNewTicket({ subject: '', description: '', category: 'Technical', priority: 'medium' });
    toast.success('Ticket created successfully!');
    setSelectedTicket(ticket);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      sender: isAdmin ? 'agent' : 'user',
      senderName: user?.name || 'You',
      timestamp: Date.now(),
      read: false,
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, messages: [...t.messages, message], updatedAt: Date.now() }
          : t
      )
    );
    setSelectedTicket((prev) =>
      prev ? { ...prev, messages: [...prev.messages, message] } : null
    );
    setNewMessage('');

    // Simulate typing and response
    if (!isAdmin) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const botResponse: Message = {
          id: `msg-${Date.now()}-bot`,
          content: 'Thank you for your message. An agent will respond shortly. In the meantime, you can check our FAQ for common solutions.',
          sender: 'bot',
          senderName: 'Support Bot',
          timestamp: Date.now(),
          read: false,
        };
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, messages: [...t.messages, botResponse], updatedAt: Date.now() }
              : t
          )
        );
        setSelectedTicket((prev) =>
          prev ? { ...prev, messages: [...prev.messages, botResponse] } : null
        );
      }, 2000);
    }
  };

  const handleUpdateStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: Date.now() } : t))
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
    }
    toast.success(`Ticket status updated to ${statusConfig[status].label}`);
  };

  const handleAssignAgent = (ticketId: string, agent: Agent) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, assignedTo: { id: agent.id, name: agent.name, avatar: agent.avatar }, updatedAt: Date.now() }
          : t
      )
    );
    toast.success(`Ticket assigned to ${agent.name}`);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
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
              {isAdmin ? 'Manage support tickets and live chats' : 'Get help from our support team'}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
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
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
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
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTicket}
                    className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white"
                  >
                    Create Ticket
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards - Admin Only */}
        {isAdmin && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TicketIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Inbox className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.open}</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.resolved}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-[#FF6A00]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.satisfaction}</p>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Ticket List */}
          <Card className={cn(
            "lg:col-span-4 flex flex-col h-[500px] lg:h-[600px]",
            selectedTicket && isMobile && "hidden"
          )}>
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Tickets</CardTitle>
                {isAdmin && (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList className="h-8">
                      <TabsTrigger value="tickets" className="text-xs px-2">All</TabsTrigger>
                      <TabsTrigger value="mine" className="text-xs px-2">Mine</TabsTrigger>
                      <TabsTrigger value="unassigned" className="text-xs px-2">Unassigned</TabsTrigger>
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
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
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
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
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
                            <AvatarImage src={ticket.customer.avatar} />
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
                              <span className="text-xs text-muted-foreground">{ticket.id}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{ticket.customer.name}</span>
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
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat/Detail View */}
          <Card className={cn(
            "lg:col-span-8 flex flex-col h-[500px] lg:h-[600px]",
            !selectedTicket && isMobile && "hidden"
          )}>
            {selectedTicket ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 shrink-0 border-b">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedTicket(null)}
                        className="shrink-0"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedTicket.customer.avatar} />
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
                        <span>{selectedTicket.id}</span>
                        <span>•</span>
                        <span>{selectedTicket.customer.name}</span>
                        <span>•</span>
                        <span>{selectedTicket.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isAdmin && (
                        <>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
                                <Users className="h-4 w-4 mr-1" />
                                Assign
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {agents.filter((a) => a.status !== 'offline').map((agent) => (
                                <DropdownMenuItem
                                  key={agent.id}
                                  onClick={() => handleAssignAgent(selectedTicket.id, agent)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {agent.name.split(' ').map((n) => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className={cn(
                                        'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                                        agentStatusConfig[agent.status].color
                                      )} />
                                    </div>
                                    <div>
                                      <p className="text-sm">{agent.name}</p>
                                      <p className="text-xs text-muted-foreground">{agent.activeChats} active chats</p>
                                    </div>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
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
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Ticket
                          </DropdownMenuItem>
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
                        const isOwnMessage = (isAdmin && message.sender === 'agent') || (!isAdmin && message.sender === 'user');
                        
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              'flex gap-3',
                              isOwnMessage && 'flex-row-reverse'
                            )}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              {message.sender === 'bot' ? (
                                <AvatarFallback className="bg-[#FF6A00]/10">
                                  <Bot className="h-4 w-4 text-[#FF6A00]" />
                                </AvatarFallback>
                              ) : message.sender === 'system' ? (
                                <AvatarFallback className="bg-muted">
                                  <Settings className="h-4 w-4" />
                                </AvatarFallback>
                              ) : (
                                <>
                                  <AvatarImage src={message.senderAvatar} />
                                  <AvatarFallback className="text-xs">
                                    {message.senderName.split(' ').map((n) => n[0]).join('')}
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <div className={cn(
                              'max-w-[70%] space-y-1',
                              isOwnMessage && 'items-end'
                            )}>
                              <div className={cn(
                                'flex items-center gap-2',
                                isOwnMessage && 'flex-row-reverse'
                              )}>
                                <span className="text-xs font-medium">{message.senderName}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(message.timestamp), 'h:mm a')}
                                </span>
                              </div>
                              <div className={cn(
                                'rounded-2xl px-4 py-2.5',
                                isOwnMessage
                                  ? 'bg-[#FF6A00] text-white rounded-tr-sm'
                                  : message.sender === 'bot'
                                    ? 'bg-[#FF6A00]/10 border border-[#FF6A00]/20 rounded-tl-sm'
                                    : 'bg-muted rounded-tl-sm'
                              )}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#FF6A00]/10">
                              <Bot className="h-4 w-4 text-[#FF6A00]" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex gap-1">
                              <motion.span
                                className="h-2 w-2 rounded-full bg-muted-foreground/50"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                              />
                              <motion.span
                                className="h-2 w-2 rounded-full bg-muted-foreground/50"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                              />
                              <motion.span
                                className="h-2 w-2 rounded-full bg-muted-foreground/50"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t shrink-0">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Paperclip className="h-5 w-5" />
                    </Button>
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
                        className="min-h-[44px] max-h-32 resize-none pr-10"
                        rows={1}
                      />
                      <Button variant="ghost" size="icon" className="absolute right-1 bottom-1 h-8 w-8">
                        <Smile className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">Select a Ticket</h3>
                <p className="text-sm text-center max-w-sm">
                  Choose a ticket from the list to view the conversation and respond to customers.
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

        {/* Online Agents - Admin Only */}
        {isAdmin && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Support Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>
                          {agent.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
                        agentStatusConfig[agent.status].color
                      )} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{agent.name}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-muted-foreground truncate">{agent.department}</span>
                        {agent.status !== 'offline' && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{agent.activeChats} chats</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
