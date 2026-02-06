import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Megaphone, Edit, Save, X, Trash2, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useAnnouncements, ImageSettings } from '@/hooks/useAnnouncements';
import { cn } from '@/lib/utils';

interface NewsBoardProps {
  isEditorMode?: boolean;
}

interface ResizableImageProps {
  src: string;
  width: number | null;
  position: 'left' | 'center' | 'right';
  onResize: (width: number) => void;
  onPositionChange: (position: 'left' | 'center' | 'right') => void;
  isEditing: boolean;
}

function ResizableImage({ src, width, position, onResize, onPositionChange, isEditing }: ResizableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width || 300);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    if (width) {
      setCurrentWidth(width);
    }
  }, [width]);

  const handleMouseDown = useCallback((e: React.MouseEvent, corner: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = currentWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = corner === 'right' 
        ? moveEvent.clientX - startXRef.current 
        : startXRef.current - moveEvent.clientX;
      const newWidth = Math.max(100, Math.min(800, startWidthRef.current + deltaX));
      setCurrentWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      onResize(currentWidth);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentWidth, onResize]);

  const positionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  if (!isEditing) {
    return (
      <div className={cn("flex mb-3", positionClasses[position])}>
        <div className="rounded-lg overflow-hidden">
          <img 
            src={src} 
            alt="Announcement" 
            style={{ width: currentWidth ? `${currentWidth}px` : 'auto', maxWidth: '100%' }}
            className="h-auto object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Position Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Position:</span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={position === 'left' ? 'default' : 'outline'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onPositionChange('left')}
          >
            <AlignLeft className="w-3 h-3" />
          </Button>
          <Button
            type="button"
            variant={position === 'center' ? 'default' : 'outline'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onPositionChange('center')}
          >
            <AlignCenter className="w-3 h-3" />
          </Button>
          <Button
            type="button"
            variant={position === 'right' ? 'default' : 'outline'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onPositionChange('right')}
          >
            <AlignRight className="w-3 h-3" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          Breite: {currentWidth}px
        </span>
      </div>

      {/* Resizable Image Container */}
      <div className={cn("flex", positionClasses[position])}>
        <div 
          ref={containerRef}
          className={cn(
            "relative rounded-lg overflow-hidden border-2 transition-colors",
            isResizing ? "border-primary" : "border-transparent hover:border-primary/50"
          )}
          style={{ width: `${currentWidth}px` }}
        >
          <img 
            src={src} 
            alt="Preview" 
            className="w-full h-auto object-cover pointer-events-none"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          
          {/* Resize Handles */}
          {/* Left Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize bg-primary/20 hover:bg-primary/40 transition-colors flex items-center justify-center"
            onMouseDown={(e) => handleMouseDown(e, 'left')}
          >
            <div className="w-1 h-8 bg-primary/60 rounded-full" />
          </div>
          
          {/* Right Handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize bg-primary/20 hover:bg-primary/40 transition-colors flex items-center justify-center"
            onMouseDown={(e) => handleMouseDown(e, 'right')}
          >
            <div className="w-1 h-8 bg-primary/60 rounded-full" />
          </div>

          {/* Corner Handles */}
          <div
            className="absolute left-0 top-0 w-4 h-4 cursor-nwse-resize bg-primary/40 hover:bg-primary/60 transition-colors rounded-br"
            onMouseDown={(e) => handleMouseDown(e, 'left')}
          />
          <div
            className="absolute right-0 top-0 w-4 h-4 cursor-nesw-resize bg-primary/40 hover:bg-primary/60 transition-colors rounded-bl"
            onMouseDown={(e) => handleMouseDown(e, 'right')}
          />
          <div
            className="absolute left-0 bottom-0 w-4 h-4 cursor-nesw-resize bg-primary/40 hover:bg-primary/60 transition-colors rounded-tr"
            onMouseDown={(e) => handleMouseDown(e, 'left')}
          />
          <div
            className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize bg-primary/40 hover:bg-primary/60 transition-colors rounded-tl"
            onMouseDown={(e) => handleMouseDown(e, 'right')}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Ziehen Sie an den Ecken oder Seiten, um die Größe anzupassen
      </p>
    </div>
  );
}

export function NewsBoard({ isEditorMode = false }: NewsBoardProps) {
  const { announcement, loading, saveAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageWidth, setImageWidth] = useState<number | null>(null);
  const [imagePosition, setImagePosition] = useState<'left' | 'center' | 'right'>('center');

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || '');
      setContent(announcement.content || '');
      setImageUrl(announcement.image_url || '');
      setImageWidth(announcement.image_width || null);
      setImagePosition((announcement.image_position as 'left' | 'center' | 'right') || 'center');
    }
  }, [announcement]);

  const handleSave = async () => {
    if (!content.trim()) return;
    const imageSettings: ImageSettings = {
      width: imageWidth,
      position: imagePosition
    };
    await saveAnnouncement(content, title, imageUrl, imageSettings);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (announcement) {
      setTitle(announcement.title || '');
      setContent(announcement.content || '');
      setImageUrl(announcement.image_url || '');
      setImageWidth(announcement.image_width || null);
      setImagePosition((announcement.image_position as 'left' | 'center' | 'right') || 'center');
    } else {
      setTitle('');
      setContent('');
      setImageUrl('');
      setImageWidth(null);
      setImagePosition('center');
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Möchten Sie die Neuigkeiten wirklich löschen?')) {
      await deleteAnnouncement();
      setTitle('');
      setContent('');
      setImageUrl('');
      setImageWidth(null);
      setImagePosition('center');
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

    const displayWidth = announcement.image_width || 300;
    const displayPosition = (announcement.image_position as 'left' | 'center' | 'right') || 'center';

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
            <ResizableImage
              src={announcement.image_url}
              width={displayWidth}
              position={displayPosition}
              onResize={() => {}}
              onPositionChange={() => {}}
              isEditing={false}
            />
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
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Schreiben Sie hier Ihre Neuigkeiten..."
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
                <div className="mt-3">
                  <ResizableImage
                    src={imageUrl}
                    width={imageWidth}
                    position={imagePosition}
                    onResize={setImageWidth}
                    onPositionChange={setImagePosition}
                    isEditing={true}
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
              <ResizableImage
                src={announcement.image_url}
                width={announcement.image_width || 300}
                position={(announcement.image_position as 'left' | 'center' | 'right') || 'center'}
                onResize={() => {}}
                onPositionChange={() => {}}
                isEditing={false}
              />
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
