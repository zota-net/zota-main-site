'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Image as ImageIcon, Video, Calendar, Clock, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/lib/store/user-store';
import { advertsService } from '@/lib/api/services/base-operations';
import { toast } from 'sonner';
import type { Advert, CreateAdvertRequest } from '@/lib/api/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';

function resolveMediaUrl(media: string) {
  if (!media) return '';
  if (media.startsWith('http://') || media.startsWith('https://')) return media;
  // Stored as /uploads/adverts/filename.jpg → served at /bop/uploads/...
  return `${API_BASE_URL}/bop${media}`;
}

export default function AdvertsPage() {
  const { user } = useUserStore();
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdvert, setEditingAdvert] = useState<Advert | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    description: '',
    media: '',
    mediaType: '' as 'image' | 'video' | '',
    duration: 604800,
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
  // Local preview URL for the selected file (before upload)
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => { loadAdverts(); }, []);

  const loadAdverts = async () => {
    if (!user?.client_id) return;
    try {
      const data = await advertsService.getByClient(user.client_id);
      setAdverts(data || []);
    } catch {
      toast.error('Failed to load adverts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploading(true);
    try {
      const result = await advertsService.uploadMedia(file);
      setFormData(prev => ({ ...prev, media: result.url, mediaType: result.mediaType }));
      toast.success('Media uploaded');
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
      setPreviewUrl('');
      setFormData(prev => ({ ...prev, media: '', mediaType: '' }));
    } finally {
      setUploading(false);
    }
  };

  const clearMedia = () => {
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, media: '', mediaType: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.client_id) return;
    setSubmitting(true);
    try {
      const data: CreateAdvertRequest = {
        description: formData.description,
        media: formData.media || undefined,
        mediaType: formData.mediaType || undefined,
        client_id: user.client_id,
        duration: formData.duration,
      };

      if (editingAdvert) {
        await advertsService.update(editingAdvert.id, data);
        toast.success('Advert updated');
      } else {
        await advertsService.create(data);
        toast.success('Advert created');
      }

      closeDialog();
      loadAdverts();
    } catch {
      toast.error('Failed to save advert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (advert: Advert) => {
    setEditingAdvert(advert);
    setFormData({
      description: advert.description,
      media: advert.media || '',
      mediaType: advert.mediaType || '',
      duration: advert.duration,
    });
    setPreviewUrl(advert.media ? resolveMediaUrl(advert.media) : '');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAdvert(null);
    setPreviewUrl('');
    setFormData({ description: '', media: '', mediaType: '', duration: 604800 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advert?')) return;
    try {
      await advertsService.delete(id);
      toast.success('Advert deleted');
      loadAdverts();
    } catch {
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

  const isExpired = (advert: Advert) => new Date(advert.endsIn) < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adverts</h1>
          <p className="text-muted-foreground">Manage advertisements shown to your customers</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingAdvert(null); setFormData({ description: '', media: '', mediaType: '', duration: 604800 }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Advert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAdvert ? 'Edit Advert' : 'Create New Advert'}</DialogTitle>
              <DialogDescription>Configure your advertisement details</DialogDescription>
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

              {/* Media upload */}
              <div>
                <Label>Media (Image or Video)</Label>
                {previewUrl ? (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-border">
                    {formData.mediaType === 'video' ? (
                      <video src={previewUrl} className="w-full max-h-48 object-contain bg-black" controls />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={clearMedia}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-2 w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Click to upload image or video</span>
                    <span className="text-xs">JPEG, PNG, GIF, WebP, MP4, WebM — max 50 MB</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
                  className="hidden"
                  onChange={handleFileChange}
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
                <p className="text-sm text-muted-foreground mt-1">{formatDuration(formData.duration)}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={submitting || uploading}>
                  {submitting ? 'Saving…' : editingAdvert ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Adverts grid */}
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
                    <CardTitle className="text-lg line-clamp-2">{advert.description}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={isExpired(advert) ? 'secondary' : 'default'}>
                        {isExpired(advert) ? 'Expired' : 'Active'}
                      </Badge>
                      {advert.mediaType && (
                        <Badge variant="outline" className="gap-1">
                          {advert.mediaType === 'video'
                            ? <Video className="w-3 h-3" />
                            : <ImageIcon className="w-3 h-3" />}
                          {advert.mediaType}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(advert.duration)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(advert)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(advert.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {advert.media && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                    {advert.mediaType === 'video' ? (
                      <video
                        src={resolveMediaUrl(baseUrl+"/bop"+advert.media)}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                        onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                      />
                    ) : (
                      <img
                        src={resolveMediaUrl(baseUrl+"/bop"+advert.media)}
                        alt={advert.description}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Expires: {new Date(advert.endsIn).toLocaleDateString()}
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
            Create your first advertisement to show content to your customers.
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
