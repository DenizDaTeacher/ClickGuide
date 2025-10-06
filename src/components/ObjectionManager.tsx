import { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useObjections } from '@/hooks/useObjections';
import { Objection, Response, ObjectionWithResponses } from '@/types/topics';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const ObjectionManager = () => {
  const { objections, loading, saveObjection, deleteObjection, saveResponse } = useObjections();
  const [editingObjection, setEditingObjection] = useState<Partial<Objection> | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<string>('');
  const [isObjectionDialogOpen, setIsObjectionDialogOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const handleSaveObjection = async () => {
    if (!editingObjection) return;
    
    // Save objection first
    const savedObjectionId = await saveObjection(editingObjection);
    
    // If there's an answer, save it as a response
    if (editingAnswer.trim() && savedObjectionId) {
      await saveResponse({
        objection_id: savedObjectionId,
        response_text: editingAnswer,
        follow_up_steps: [],
        sort_order: 0,
      });
    }
    
    setEditingObjection(null);
    setEditingAnswer('');
    setIsObjectionDialogOpen(false);
  };

  const handleNewObjection = () => {
    setEditingObjection({
      title: '',
      keywords: [],
      description: '',
    });
    setEditingAnswer('');
    setIsObjectionDialogOpen(true);
  };

  const handleEditObjection = (objection: ObjectionWithResponses) => {
    setEditingObjection(objection);
    setEditingAnswer(objection.responses[0]?.response_text || '');
    setIsObjectionDialogOpen(true);
  };

  const addKeyword = () => {
    if (!keywordInput.trim() || !editingObjection) return;
    setEditingObjection({
      ...editingObjection,
      keywords: [...(editingObjection.keywords || []), keywordInput.trim()],
    });
    setKeywordInput('');
  };

  const removeKeyword = (keyword: string) => {
    if (!editingObjection) return;
    setEditingObjection({
      ...editingObjection,
      keywords: (editingObjection.keywords || []).filter(k => k !== keyword),
    });
  };

  if (loading) {
    return <div className="p-4">Lade Einwände...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Einwände & Antworten verwalten</h2>
        <Dialog open={isObjectionDialogOpen} onOpenChange={setIsObjectionDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewObjection}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Einwand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingObjection?.id ? 'Einwand bearbeiten' : 'Neuer Einwand'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titel des Einwands</Label>
                <Input
                  id="title"
                  value={editingObjection?.title || ''}
                  onChange={(e) =>
                    setEditingObjection({ ...editingObjection, title: e.target.value })
                  }
                  placeholder="z.B. Zu teuer, Kein Interesse, etc."
                />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={editingObjection?.description || ''}
                  onChange={(e) =>
                    setEditingObjection({ ...editingObjection, description: e.target.value })
                  }
                  placeholder="Weitere Details zum Einwand..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Keywords (für Fuzzy-Suche)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    placeholder="Keyword eingeben und Enter"
                  />
                  <Button type="button" onClick={addKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editingObjection?.keywords || []).map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="answer">Musterantwort</Label>
                <Textarea
                  id="answer"
                  value={editingAnswer}
                  onChange={(e) => setEditingAnswer(e.target.value)}
                  placeholder="Empfohlene Antwort auf diesen Einwand..."
                  rows={6}
                />
              </div>
              <Button onClick={handleSaveObjection} className="w-full">
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {objections.map((objection) => (
          <AccordionItem key={objection.id} value={objection.id}>
            <Card>
              <CardHeader>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2">
                      <CardTitle>{objection.title}</CardTitle>
                      {objection.responses.length > 0 && (
                        <Badge variant="secondary">Antwort vorhanden</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditObjection(objection);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteObjection(objection.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="space-y-4">
                  {objection.description && (
                    <div>
                      <Label className="text-sm font-semibold">Beschreibung:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{objection.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-semibold">Keywords:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {objection.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Musterantwort:</Label>
                    {objection.responses.length > 0 ? (
                      <Card className="bg-success/5 border-success/20">
                        <CardContent className="pt-4">
                          <p className="text-sm whitespace-pre-wrap">
                            {objection.responses[0].response_text}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Keine Antwort hinterlegt</p>
                    )}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
