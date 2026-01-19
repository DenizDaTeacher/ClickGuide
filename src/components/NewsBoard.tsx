import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Edit, Save, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';

interface NewsBoardProps {
  isEditorMode?: boolean;
}

export function NewsBoard({ isEditorMode = false }: NewsBoardProps) {
  const { announcement, loading, saveAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || '');
      setContent(announcement.content || '');
      setImageUrl(announcement.image_url || '');
    }
  }, [announcement]);

  const handleSave = async () => {
    if (!content.trim()) return;
    await saveAnnouncement(content, title, imageUrl);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (announcement) {
      setTitle(announcement.title || '');
      setContent(announcement.content || '');
      setImageUrl(announcement.image_url || '');
    } else {
      setTitle('');
      setContent('');
      setImageUrl('');
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Möchten Sie die Neuigkeiten wirklich löschen?')) {
      await deleteAnnouncement();
      setTitle('');
      setContent('');
      setImageUrl('');
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-primary/20 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-primary/20 rounded"></div>
                <div className="h-4 bg-primary/20 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agent mode - read only view
  if (!isEditorMode) {
    if (!announcement) return null;

    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
              {announcement.title || 'Neuigkeiten'}
            </CardTitle>
            <Badge variant="outline" className="ml-auto text-xs text-amber-600 border-amber-300">
              Aktuell
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {announcement.image_url && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img 
                src={announcement.image_url} 
                alt="Announcement" 
                className="w-full max-h-48 object-cover"
              />
            </div>
          )}
          <div 
            className="text-sm text-foreground/80 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </CardContent>
      </Card>
    );
  }

  // Editor mode - editable view
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
              Neuigkeiten verwalten
            </CardTitle>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
              >
                <Edit className="w-4 h-4 mr-1" />
                Bearbeiten
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Abbrechen
                </Button>
                {announcement && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDelete}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Löschen
                  </Button>
                )}
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={!content.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Speichern
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">
                Titel (optional)
              </label>
              <Input
                placeholder="z.B. Wichtige Mitteilung"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white dark:bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">
                Inhalt
              </label>
              <Textarea
                placeholder="Schreiben Sie hier Ihre Neuigkeiten..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="bg-white dark:bg-background resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                Bild-URL (optional)
              </label>
              <Input
                placeholder="https://example.com/bild.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-white dark:bg-background"
              />
              {imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full max-h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : announcement ? (
          <>
            {announcement.title && (
              <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                {announcement.title}
              </h3>
            )}
            {announcement.image_url && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img 
                  src={announcement.image_url} 
                  alt="Announcement" 
                  className="w-full max-h-48 object-cover"
                />
              </div>
            )}
            <div 
              className="text-sm text-foreground/80 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Noch keine Neuigkeiten vorhanden.</p>
            <p className="text-sm">Klicken Sie auf "Bearbeiten", um eine Neuigkeit zu erstellen.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
