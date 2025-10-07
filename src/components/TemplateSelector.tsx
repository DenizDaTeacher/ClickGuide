import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  created_at: string;
}

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateLoad: (templateId: string, templateName: string) => Promise<void>;
}

export function TemplateSelector({ isOpen, onClose, onTemplateLoad }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Fehler",
        description: "Templates konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTemplate = async (templateId: string, templateName: string) => {
    try {
      await onTemplateLoad(templateId, templateName);
      onClose();
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Workflow-Vorlagen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Lade Vorlagen...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Vorlagen verfügbar
            </div>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        {template.is_default && (
                          <Badge variant="secondary">Standard</Badge>
                        )}
                      </CardTitle>
                      {template.description && (
                        <CardDescription>{template.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      onClick={() => handleLoadTemplate(template.id, template.name)}
                      size="sm"
                      className="ml-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Laden
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
