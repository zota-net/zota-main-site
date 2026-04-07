'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Image as ImageIcon, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/lib/store/user-store';
import { advertsService } from '@/lib/api/services/base-operations';
import { toast } from 'sonner';
import type { Advert, CreateAdvertRequest } from '@/lib/api/types';

export default function AdvertsPage() {
  const { user } = useUserStore();
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdvert, setEditingAdvert] = useState<Advert | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    media: '',
    duration: 604800, // 7 days in seconds
  });

  useEffect(() => {
    loadAdverts();
  }, []);

  const loadAdverts = async () => {
    if (!user?.client_id) return;

    try {
      const data = await advertsService.getByClient(user.client_id);
      setAdverts(data);
    } catch (error) {
      toast.error('Failed to load adverts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.client_id) return;

    try {
      const data: CreateAdvertRequest = {
        description: formData.description,
        media: formData.media,
        client_id: user.client_id,
        duration: formData.duration,
      };

      if (editingAdvert) {
        await advertsService.update(editingAdvert.id, data);
        toast.success('Advert updated successfully');
      } else {
        await advertsService.create(data);
        toast.success('Advert created successfully');
      }

      setDialogOpen(false);
      setEditingAdvert(null);
      setFormData({ description: '', media: '', duration: 604800 });
      loadAdverts();
    } catch (error) {
      toast.error('Failed to save advert');
    }
  };

  const handleEdit = (advert: Advert) => {
    setEditingAdvert(advert);
    setFormData({
      description: advert.description,
      media: advert.media,
      duration: advert.duration,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advert?')) return;

    try {
      await advertsService.delete(id);
      toast.success('Advert deleted successfully');
      loadAdverts();
    } catch (error) {
      toast.error('Failed to delete advert');
    }
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${Math.floor(seconds / 60)} minutes`;
  };

  const isExpired = (advert: Advert) => {
    return new Date(advert.endsIn) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adverts</h1>
          <p className="text-muted-foreground">
            Manage advertisements shown to your customers
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAdvert(null);
              setFormData({ description: '', media: '', duration: 604800 });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Advert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAdvert ? 'Edit Advert' : 'Create New Advert'}
              </DialogTitle>
              <DialogDescription>
                Configure your advertisement details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Advert description..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="media">Media URL</Label>
                <Input
                  id="media"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.media}
                  onChange={(e) => setFormData(prev => ({ ...prev, media: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="3600"
                  max="2592000"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDuration(formData.duration)}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAdvert ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Adverts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adverts.map((advert) => (
          <motion.div
            key={advert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`relative ${isExpired(advert) ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {advert.description}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={isExpired(advert) ? 'secondary' : 'default'}>
                        {isExpired(advert) ? 'Expired' : 'Active'}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(advert.duration)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(advert)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(advert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {advert.media && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                    {advert.media.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={advert.media}
                        alt={advert.description}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expires: {new Date(advert.endsIn).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {adverts.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No adverts yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first advertisement to start showing content to your customers.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Advert
          </Button>
        </div>
      )}
    </div>
  );
}