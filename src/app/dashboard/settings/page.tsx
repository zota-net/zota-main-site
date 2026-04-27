'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Palette,
  User,
  Bell,
  Shield,
  Monitor,
  Moon,
  Sun,
  Upload,
  Check,
  Trash2,
  Plus,
  Eye,
  KeyRound,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { PageTransition, Logo } from '@/components/common';
import { useTheme } from 'next-themes';
import { useThemeStore, defaultThemes, ColorTheme } from '@/lib/store/theme-store';
import { useAppStore } from '@/lib/store/app-store';
import { useUserStore } from '@/lib/store/user-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { authService } from '@/lib/api/services/auth';
import { ApiError } from '@/lib/api/client';

function ThemeCard({ 
  theme, 
  isActive, 
  onSelect,
  onDelete,
  isCustom = false
}: { 
  theme: ColorTheme; 
  isActive: boolean; 
  onSelect: () => void;
  onDelete?: () => void;
  isCustom?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'relative cursor-pointer rounded-lg border p-4 transition-all',
        isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
      )}
    >
      {isActive && (
        <div className="absolute top-2 right-2">
          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: theme.primary }}
        />
        <div 
          className="h-6 w-6 rounded-full border-2 border-white shadow-sm -ml-4"
          style={{ backgroundColor: theme.accent }}
        />
        <span className="font-medium text-sm">{theme.name}</span>
      </div>
      
      <div className="flex gap-1.5">
        {[theme.primary, theme.accent, theme.secondary, theme.destructive].map((color, i) => (
          <div
            key={i}
            className="h-4 flex-1 rounded-sm first:rounded-l-md last:rounded-r-md"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      {isCustom && onDelete && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute bottom-2 right-2 h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground" />
        </Button>
      )}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { 
    activeThemeId, 
    setActiveTheme, 
    customThemes, 
    addCustomTheme, 
    deleteCustomTheme,
    branding,
    setBranding,
    resetToDefaults 
  } = useThemeStore();
  const { settings, setSetting, setSettings, resetSettings } = useAppStore();
  const { user, updateUser, updatePreferences } = useUserStore();
  
  const [newTheme, setNewTheme] = useState<Partial<ColorTheme>>({
    name: '',
    primary: '#FF6A00',
    accent: '#00D9FF',
    secondary: '#1a1a1a',
    destructive: '#E63946',
    warning: '#FBBF24',
    success: '#10B981',
    info: '#3B82F6',
  });
  const [createThemeOpen, setCreateThemeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Password reset state ──────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        client_id: user?.client_id,
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const allThemes = [...defaultThemes, ...customThemes];

  const handleCreateTheme = () => {
    if (!newTheme.name) {
      toast.error('Please enter a theme name');
      return;
    }
    
    const theme: ColorTheme = {
      id: `custom-${Date.now()}`,
      name: newTheme.name,
      primary: newTheme.primary || '#FF6A00',
      primaryForeground: '#FFFFFF',
      accent: newTheme.accent || '#00D9FF',
      accentForeground: '#000000',
      secondary: newTheme.secondary || '#1a1a1a',
      secondaryForeground: '#FFFFFF',
      destructive: newTheme.destructive || '#E63946',
      warning: newTheme.warning || '#FBBF24',
      success: newTheme.success || '#10B981',
      info: newTheme.info || '#3B82F6',
    };
    
    addCustomTheme(theme);
    setActiveTheme(theme.id);
    setCreateThemeOpen(false);
    toast.success('Theme created successfully');
    
    setNewTheme({
      name: '',
      primary: '#FF6A00',
      accent: '#00D9FF',
      secondary: '#1a1a1a',
      destructive: '#E63946',
    });
  };

  const handleLogoUpload = (type: 'logo' | 'logoLight' | 'logoDark') => {
    // In a real app, this would upload to a server
    // For demo, we'll use a placeholder
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            {/* Theme Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Theme Mode</CardTitle>
                <CardDescription>
                  Choose between light, dark, or system theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={theme}
                  onValueChange={setTheme}
                  className="grid grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="light"
                    className={cn(
                      'flex flex-col items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all',
                      theme === 'light' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    )}
                  >
                    <RadioGroupItem value="light" id="light" className="sr-only" />
                    <Sun className="h-6 w-6" />
                    <span className="font-medium">Light</span>
                  </Label>
                  <Label
                    htmlFor="dark"
                    className={cn(
                      'flex flex-col items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all',
                      theme === 'dark' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    )}
                  >
                    <RadioGroupItem value="dark" id="dark" className="sr-only" />
                    <Moon className="h-6 w-6" />
                    <span className="font-medium">Dark</span>
                  </Label>
                  <Label
                    htmlFor="system"
                    className={cn(
                      'flex flex-col items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all',
                      theme === 'system' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    )}
                  >
                    <RadioGroupItem value="system" id="system" className="sr-only" />
                    <Monitor className="h-6 w-6" />
                    <span className="font-medium">System</span>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Color Themes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Color Theme</CardTitle>
                  <CardDescription>
                    Select a color theme or create your own
                  </CardDescription>
                </div>
                <Dialog open={createThemeOpen} onOpenChange={setCreateThemeOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Theme
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Custom Theme</DialogTitle>
                      <DialogDescription>
                        Define your custom color palette
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Theme Name</Label>
                        <Input
                          value={newTheme.name}
                          onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                          placeholder="My Custom Theme"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Primary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={newTheme.primary}
                              onChange={(e) => setNewTheme({ ...newTheme, primary: e.target.value })}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              value={newTheme.primary}
                              onChange={(e) => setNewTheme({ ...newTheme, primary: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Accent Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={newTheme.accent}
                              onChange={(e) => setNewTheme({ ...newTheme, accent: e.target.value })}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              value={newTheme.accent}
                              onChange={(e) => setNewTheme({ ...newTheme, accent: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Secondary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={newTheme.secondary}
                              onChange={(e) => setNewTheme({ ...newTheme, secondary: e.target.value })}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              value={newTheme.secondary}
                              onChange={(e) => setNewTheme({ ...newTheme, secondary: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Destructive Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={newTheme.destructive}
                              onChange={(e) => setNewTheme({ ...newTheme, destructive: e.target.value })}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              value={newTheme.destructive}
                              onChange={(e) => setNewTheme({ ...newTheme, destructive: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Preview */}
                      <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="flex gap-2 p-4 rounded-lg border">
                          {[newTheme.primary, newTheme.accent, newTheme.secondary, newTheme.destructive].map((color, i) => (
                            <div
                              key={i}
                              className="h-8 flex-1 rounded"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateThemeOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTheme}>Create Theme</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {defaultThemes.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isActive={activeThemeId === theme.id}
                      onSelect={() => setActiveTheme(theme.id)}
                    />
                  ))}
                  {customThemes.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isActive={activeThemeId === theme.id}
                      onSelect={() => setActiveTheme(theme.id)}
                      onDelete={() => deleteCustomTheme(theme.id)}
                      isCustom
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Branding</CardTitle>
                <CardDescription>
                  Customize the platform with your company's branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={branding.companyName}
                    onChange={(e) => setBranding({ companyName: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>Logo Preview</Label>
                  <div className="p-6 rounded-lg border bg-muted/30 flex items-center justify-center">
                    <Logo size="xl" />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Main Logo</Label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleLogoUpload('logo')}
                    >
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Light Mode Logo</Label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleLogoUpload('logoLight')}
                    >
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dark Mode Logo</Label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleLogoUpload('logoDark')}
                    >
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </div>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    // Handle file upload
                    toast.info('Logo upload would be handled here');
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={user?.name || ''}
                      onChange={(e) => updateUser({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={user?.email || ''}
                      onChange={(e) => updateUser({ email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.role || ''} disabled className="bg-muted" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password. We recommend using a strong, unique password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.newPw ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password (min 8 chars)"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setShowPasswords((p) => ({ ...p, newPw: !p.newPw }))}
                    >
                      {showPasswords.newPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordForm.newPassword && passwordForm.newPassword.length < 8 && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> At least 8 characters required
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Passwords do not match
                    </p>
                  )}
                  {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length >= 8 && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={passwordLoading}
                    className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white font-semibold"
                  >
                    {passwordLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Update Password
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={user?.preferences?.emailNotifications}
                    onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={user?.preferences?.pushNotifications}
                    onCheckedChange={(checked) => updatePreferences({ pushNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for alerts
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSetting('soundEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize the application interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable interface animations
                    </p>
                  </div>
                  <Switch
                    checked={settings.animationsEnabled}
                    onCheckedChange={(checked) => setSetting('animationsEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for more content
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => setSetting('compactMode', checked)}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Data Refresh Rate</Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.refreshRate}s
                    </span>
                  </div>
                  <Slider
                    value={[settings.refreshRate]}
                    onValueChange={([value]) => setSetting('refreshRate', value)}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    How often to refresh network data (1-30 seconds)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Regional and format settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={user?.preferences?.timezone || 'UTC'}
                      onValueChange={(value) => updatePreferences({ timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={user?.preferences?.dateFormat || 'MMM dd, yyyy'}
                      onValueChange={(value) => updatePreferences({ dateFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MMM dd, yyyy">Jan 01, 2026</SelectItem>
                        <SelectItem value="dd/MM/yyyy">01/01/2026</SelectItem>
                        <SelectItem value="MM/dd/yyyy">01/01/2026</SelectItem>
                        <SelectItem value="yyyy-MM-dd">2026-01-01</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={user?.preferences?.language || 'en'}
                    onValueChange={(value) => updatePreferences({ language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div>
                    <p className="font-medium">Reset All Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Reset all settings to their default values
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      resetSettings();
                      resetToDefaults();
                      toast.success('Settings reset to defaults');
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
