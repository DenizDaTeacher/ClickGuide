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
import { Objection, Response } from '@/types/topics';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const ObjectionManager = () => {
  const { objections, loading, saveObjection, deleteObjection, saveResponse, deleteResponse } = useObjections();
  const [editingObjection, setEditingObjection] = useState<Partial<Objection> | null>(null);
  const [editingResponse, setEditingResponse] = useState<Partial<Response> | null>(null);
  const [isObjectionDialogOpen, setIsObjectionDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const handleSaveObjection = async () => {
    if (!editingObjection) return;
    await saveObjection(editingObjection);
    setEditingObjection(null);
    setIsObjectionDialogOpen(false);
  };

  const handleSaveResponse = async () => {
    if (!editingResponse) return;
    await saveResponse(editingResponse);
    setEditingResponse(null);
    setIsResponseDialogOpen(false);
  };

  const handleNewObjection = () => {
    setEditingObjection({
      title: '',
      keywords: [],
      category: '',
      priority: 0,
    });
    setIsObjectionDialogOpen(true);
  };

  const handleNewResponse = (objectionId: string) => {
    setEditingResponse({
      objection_id: objectionId,
      response_text: '',
      follow_up_steps: [],
      sort_order: 0,
    });
    setIsResponseDialogOpen(true);
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
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={editingObjection?.title || ''}
                  onChange={(e) =>
                    setEditingObjection({ ...editingObjection, title: e.target.value })
                  }
                  placeholder="z.B. Zu teuer"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Input
                  id="category"
                  value={editingObjection?.category || ''}
                  onChange={(e) =>
                    setEditingObjection({ ...editingObjection, category: e.target.value })
                  }
                  placeholder="z.B. Preis"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priorität (0-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="10"
                  value={editingObjection?.priority || 0}
                  onChange={(e) =>
                    setEditingObjection({ ...editingObjection, priority: parseInt(e.target.value) })
                  }
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
                      {objection.category && (
                        <Badge variant="outline">{objection.category}</Badge>
                      )}
                      <Badge>Priorität: {objection.priority}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingObjection(objection);
                          setIsObjectionDialogOpen(true);
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
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Antworten:</Label>
                      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNewResponse(objection.id)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Antwort hinzufügen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {editingResponse?.id ? 'Antwort bearbeiten' : 'Neue Antwort'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="response_text">Antworttext</Label>
                              <Textarea
                                id="response_text"
                                value={editingResponse?.response_text || ''}
                                onChange={(e) =>
                                  setEditingResponse({
                                    ...editingResponse,
                                    response_text: e.target.value,
                                  })
                                }
                                placeholder="Empfohlene Antwort eingeben"
                                rows={6}
                              />
                            </div>
                            <Button onClick={handleSaveResponse} className="w-full">
                              Speichern
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {objection.responses.map((response) => (
                      <Card key={response.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm whitespace-pre-wrap flex-1">
                              {response.response_text}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingResponse(response);
                                  setIsResponseDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteResponse(response.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
