import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit, Grid3x3, Palette } from 'lucide-react';
import { Topic } from '@/types/topics';
import { CallStep } from '@/hooks/useCallSteps';
import { useToast } from '@/hooks/use-toast';
import { useTopics } from '@/hooks/useTopics';

interface StepTopicManagerProps {
  stepId: string;
  onSaveSubStep: (subStep: CallStep, topicId: string) => Promise<void>;
  onDeleteSubStep: (subStepId: string, topicId: string) => Promise<void>;
  getSubStepsForTopic: (topicId: string) => CallStep[];
}

export function StepTopicManager({ 
  stepId, 
  onSaveSubStep,
  onDeleteSubStep,
  getSubStepsForTopic 
}: StepTopicManagerProps) {
  const { toast } = useToast();
  const { topics, saveTopic, deleteTopic } = useTopics();
  const [stepTopics, setStepTopics] = useState<Topic[]>([]);
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [showSubStepDialog, setShowSubStepDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [topicFormData, setTopicFormData] = useState<Partial<Topic>>({
    name: '',
    description: '',
    icon: '',
    color: '#3b82f6'
  });
  const [subStepFormData, setSubStepFormData] = useState<Partial<CallStep>>({
    title: '',
    description: '',
    communication: ''
  });

  // Filter topics for this step
  useEffect(() => {
    const filtered = topics.filter(t => t.step_id === stepId);
    setStepTopics(filtered);
  }, [topics, stepId]);

  const handleAddTopic = () => {
    setEditingTopic(null);
    setTopicFormData({
      name: '',
      description: '',
      icon: '📋',
      color: '#3b82f6'
    });
    setShowTopicDialog(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicFormData(topic);
    setShowTopicDialog(true);
  };

  const handleSaveTopic = async () => {
    if (!topicFormData.name?.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie einen Namen ein',
        variant: 'destructive'
      });
      return;
    }

    try {
      await saveTopic({
        ...topicFormData,
        step_id: stepId,
        id: editingTopic?.id,
        sort_order: editingTopic?.sort_order || stepTopics.length
      });
      setShowTopicDialog(false);
    } catch (error) {
      console.error('Error saving topic:', error);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (confirm('Möchten Sie dieses Anliegen wirklich löschen?')) {
      await deleteTopic(topicId);
    }
  };

  const handleAddSubStep = (topicId: string) => {
    setSelectedTopicId(topicId);
    setSubStepFormData({
      title: '',
      description: '',
      communication: '',
      required: false
    });
    setShowSubStepDialog(true);
  };

  const handleSaveSubStep = async () => {
    if (!selectedTopicId || !subStepFormData.title?.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte füllen Sie alle Pflichtfelder aus',
        variant: 'destructive'
      });
      return;
    }

    const newSubStep: CallStep = {
      id: `substep-${Date.now()}`,
      title: subStepFormData.title!,
      description: subStepFormData.description || '',
      communication: subStepFormData.communication || '',
      stepType: 'sub_step',
      required: subStepFormData.required || false,
      completed: false,
      parentStepId: stepId,
      parentTopicId: selectedTopicId,
      nextStepConditions: [],
      positionX: 0,
      positionY: 0,
      isStartStep: false,
      isEndStep: false,
      sortOrder: 0,
      workflowName: 'Gesprächsschritte',
      actionButtons: []
    };

    await onSaveSubStep(newSubStep, selectedTopicId);
    setShowSubStepDialog(false);
    setSelectedTopicId(null);
  };

  const commonIcons = ['📋', '📞', '💰', '🔧', '📍', '❌', '✅', '⚠️', '📝', '🎯'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Anliegen für diesen Schritt</h3>
        <Button onClick={handleAddTopic} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Anliegen hinzufügen
        </Button>
      </div>

      {stepTopics.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Noch keine Anliegen definiert. Fügen Sie ein Anliegen hinzu.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stepTopics.map(topic => {
            const subSteps = getSubStepsForTopic(topic.id);
            return (
              <Card key={topic.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{topic.icon}</span>
                      <CardTitle className="text-base">{topic.name}</CardTitle>
                      <Badge variant="secondary">{subSteps.length} Unterschritte</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTopic(topic)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTopic(topic.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Unterschritte</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddSubStep(topic.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Unterschritt hinzufügen
                      </Button>
                    </div>
                    {subSteps.length > 0 ? (
                      <div className="space-y-2">
                        {subSteps.map((subStep, index) => (
                          <div
                            key={subStep.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              <span className="font-medium">{subStep.title}</span>
                              {subStep.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Pflicht
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteSubStep(subStep.id, topic.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Noch keine Unterschritte definiert
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Topic Dialog */}
      <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTopic ? 'Anliegen bearbeiten' : 'Neues Anliegen'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={topicFormData.name || ''}
                onChange={e => setTopicFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Tarifwechsel, Störung, Kündigung"
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={topicFormData.description || ''}
                onChange={e => setTopicFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kurze Beschreibung des Anliegens"
                rows={3}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" />
                Icon
              </Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {commonIcons.map(icon => (
                  <Button
                    key={icon}
                    type="button"
                    variant={topicFormData.icon === icon ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTopicFormData(prev => ({ ...prev, icon }))}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Farbe
              </Label>
              <Input
                type="color"
                value={topicFormData.color || '#3b82f6'}
                onChange={e => setTopicFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTopicDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveTopic}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-Step Dialog */}
      <Dialog open={showSubStepDialog} onOpenChange={setShowSubStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unterschritt hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titel *</Label>
              <Input
                value={subStepFormData.title || ''}
                onChange={e => setSubStepFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titel des Unterschritts"
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={subStepFormData.description || ''}
                onChange={e => setSubStepFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Was ist zu tun?"
                rows={3}
              />
            </div>
            <div>
              <Label>Kommunikationsvorlage</Label>
              <Textarea
                value={subStepFormData.communication || ''}
                onChange={e => setSubStepFormData(prev => ({ ...prev, communication: e.target.value }))}
                placeholder="Was soll der Agent sagen?"
                rows={3}
              />
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSubStepDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveSubStep}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
