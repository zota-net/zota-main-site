'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  MoreHorizontal,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Key,
  History,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition, AnimatedCounter } from '@/components/common';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// User types
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'operator' | 'viewer' | 'customer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  department?: string;
  permissions: string[];
}

// Generate mock users
const generateUsers = (): User[] => {
  const roles: User['role'][] = ['admin', 'operator', 'viewer', 'customer'];
  const statuses: User['status'][] = ['active', 'inactive', 'suspended', 'pending'];
  const departments = ['Engineering', 'Operations', 'Sales', 'Support', 'Management'];
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Robert', 'Amanda'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  return Array.from({ length: 40 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = i < 2 ? 'admin' : roles[Math.floor(Math.random() * roles.length)];
    
    return {
      id: `user-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      role,
      status: i < 30 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastLogin: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      department: departments[Math.floor(Math.random() * departments.length)],
      permissions: role === 'admin' 
        ? ['all'] 
        : role === 'operator' 
          ? ['read', 'write', 'manage_devices'] 
          : role === 'viewer' 
            ? ['read'] 
            : ['read', 'self_manage'],
    };
  });
};

const initialUsers = generateUsers();

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: ShieldAlert },
  operator: { label: 'Operator', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: ShieldCheck },
  viewer: { label: 'Viewer', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: Shield },
  customer: { label: 'Customer', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: Users },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: XCircle },
  suspended: { label: 'Suspended', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: Ban },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // New/Edit user form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'viewer' as User['role'],
    department: '',
    status: 'active' as User['status'],
  });

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    admins: users.filter((u) => u.role === 'admin').length,
    pending: users.filter((u) => u.status === 'pending').length,
  }), [users]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers(selectedUsers.filter((u) => u !== id));
    }
  };

  const handleCreateUser = () => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      createdAt: new Date(),
      department: formData.department,
      permissions: formData.role === 'admin' 
        ? ['all'] 
        : formData.role === 'operator' 
          ? ['read', 'write', 'manage_devices'] 
          : ['read'],
    };
    
    setUsers([newUser, ...users]);
    setCreateDialogOpen(false);
    resetForm();
    toast.success('User created successfully');
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.map((u) => 
      u.id === selectedUser.id 
        ? { ...u, ...formData }
        : u
    ));
    setEditDialogOpen(false);
    setSelectedUser(null);
    resetForm();
    toast.success('User updated successfully');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setDeleteDialogOpen(false);
    setSelectedUser(null);
    toast.success('User deleted successfully');
  };

  const handleDeleteSelected = () => {
    setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
    toast.success(`${selectedUsers.length} users deleted`);
    setSelectedUsers([]);
  };

  const handleSuspendUser = (id: string) => {
    setUsers(users.map((u) => 
      u.id === id ? { ...u, status: 'suspended' as const } : u
    ));
    toast.success('User suspended');
  };

  const handleActivateUser = (id: string) => {
    setUsers(users.map((u) => 
      u.id === id ? { ...u, status: 'active' as const } : u
    ));
    toast.success('User activated');
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department || '',
      status: user.status,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'viewer',
      department: '',
      status: 'active',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              User Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 sm:h-9">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-8 sm:h-9">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add User</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Create New User</DialogTitle>
                  <DialogDescription className="text-sm">
                    Add a new user to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Full Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 555-555-5555"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Engineering"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="operator">Operator</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: User['status']) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser} disabled={!formData.name || !formData.email}>
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Users', value: stats.total, color: 'text-primary', icon: Users },
            { label: 'Active', value: stats.active, color: 'text-green-500', icon: UserCheck },
            { label: 'Admins', value: stats.admins, color: 'text-red-500', icon: ShieldAlert },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-500', icon: Clock },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                  <p className={cn('text-3xl font-bold mt-2', stat.color)}>
                    <AnimatedCounter value={stat.value} />
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedUsers.length} selected
                  </span>
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.slice(0, 15).map((user) => {
                      const roleInfo = roleConfig[user.role];
                      const statusInfo = statusConfig[user.status];
                      const RoleIcon = roleInfo.icon;
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={roleInfo.color}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {roleInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.department || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatLastLogin(user.lastLogin)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Key className="h-4 w-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <History className="h-4 w-4 mr-2" />
                                  Activity Log
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === 'active' ? (
                                  <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => openDeleteDialog(user)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            
            {filteredUsers.length > 15 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing 15 of {filteredUsers.length} users
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: User['status']) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
