import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CallStep, NextStepCondition, ActionButton, ButtonTemplate } from "@/hooks/useCallSteps";
import { Plus, Trash2, Settings, MousePointer, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStepEditorProps {
  step?: CallStep;
  allSteps?: CallStep[];
  onSave: (step: CallStep) => void;
  onCancel?: () => void;
  buttonTemplates: ButtonTemplate[];
  onSaveButtonTemplate: (template: Omit<ButtonTemplate, 'id'>) => Promise<ButtonTemplate>;
  onDeleteButtonTemplate: (templateId: string) => Promise<void>;
}

export function WorkflowStepEditor({ 
  step, 
  allSteps, 
  onSave, 
  onCancel,
  buttonTemplates,
  onSaveButtonTemplate,
  onDeleteButtonTemplate
}: WorkflowStepEditorProps) {
  const { toast } = useToast();

  // Ensure step has default "Schritt abgeschlossen" button if no buttons exist
  const ensureDefaultButton = (stepData: CallStep): CallStep => {
    if (!stepData.actionButtons || stepData.actionButtons.length === 0) {
      const defaultTemplate = buttonTemplates.find(t => t.name === 'Schritt abgeschlossen');
      if (defaultTemplate) {
        return {
          ...stepData,
          actionButtons: [{
            id: `action-${Date.now()}`,
            label: defaultTemplate.label,
            variant: defaultTemplate.variant,
            actionType: defaultTemplate.actionType,
            statusMessage: defaultTemplate.statusMessage,
            icon: defaultTemplate.icon,
            enabled: true,
            templateName: defaultTemplate.name,
            statusIcon: defaultTemplate.statusIcon,
            statusBackgroundColor: defaultTemplate.statusBackgroundColor
          }]
        };
      } else {
        // Fallback default button
        return {
          ...stepData,
          actionButtons: [{
            id: `action-${Date.now()}`,
            label: 'Schritt abgeschlossen',
            variant: 'default' as const,
            actionType: 'complete' as const,
            statusMessage: 'Schritt wurde erfolgreich abgeschlossen.',
            icon: '✓',
            enabled: true
          }]
        };
      }
    }
    return stepData;
  };

  const [formData, setFormData] = useState<CallStep>(() => {
    const initialData = step || {
      id: `step-${Date.now()}`,
      title: '',
      description: '',
      communication: '',
      completed: false,
      required: false,
      parentStepId: undefined,
      stepType: 'normal' as const,
      conditionLabel: '',
      nextStepConditions: [],
      positionX: 0,
      positionY: 0,
      isStartStep: false,
      isEndStep: false,
      category: '',
      subSteps: [],
      sortOrder: allSteps ? allSteps.length + 1 : 1,
      workflowName: 'Gesprächsschritte',
      actionButtons: [],
      statusBackgroundColor: '',
      statusIcon: ''
    };
    
    return ensureDefaultButton(initialData);
  });

  const [showButtonDialog, setShowButtonDialog] = useState(false);
  const [editingButtonIndex, setEditingButtonIndex] = useState<number | null>(null);
  const [buttonFormData, setButtonFormData] = useState<ActionButton>({
    id: '',
    label: '',
    variant: 'default',
    actionType: 'complete',
    statusMessage: '',
    icon: '',
    enabled: true
  });

  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [currentButtonForTemplate, setCurrentButtonForTemplate] = useState<ActionButton | null>(null);

  const handleInputChange = (field: keyof CallStep, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const finalData = ensureDefaultButton(formData);
    onSave(finalData);
  };

  const handleAddButton = () => {
    setEditingButtonIndex(null);
    setButtonFormData({
      id: `action-${Date.now()}`,
      label: '',
      variant: 'default',
      actionType: 'complete',
      statusMessage: '',
      icon: '',
      enabled: true
    });
    setShowButtonDialog(true);
  };

  const handleEditButton = (index: number) => {
    setEditingButtonIndex(index);
    setButtonFormData({ ...formData.actionButtons![index] });
    setShowButtonDialog(true);
  };

  const handleSaveButton = () => {
    const updatedButtons = [...(formData.actionButtons || [])];
    
    if (editingButtonIndex !== null) {
      updatedButtons[editingButtonIndex] = buttonFormData;
    } else {
      updatedButtons.push(buttonFormData);
    }
    
    setFormData(prev => ({ ...prev, actionButtons: updatedButtons }));
    setShowButtonDialog(false);
  };

  const handleDeleteButton = (index: number) => {
    const updatedButtons = formData.actionButtons?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, actionButtons: updatedButtons }));
  };

  const handleSaveTemplate = async (button: ActionButton) => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen für die Vorlage ein",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSaveButtonTemplate({
        name: newTemplateName,
        label: button.label,
        variant: button.variant,
        icon: button.icon,
        actionType: button.actionType,
        statusMessage: button.statusMessage,
        statusIcon: button.statusIcon,
        statusBackgroundColor: button.statusBackgroundColor
      });

      toast({
        title: "Vorlage gespeichert",
        description: `Die Vorlage "${newTemplateName}" wurde erfolgreich gespeichert.`
      });

      setNewTemplateName('');
      setShowSaveTemplateDialog(false);
      setCurrentButtonForTemplate(null);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Vorlage konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const handleApplyTemplate = (template: ButtonTemplate) => {
    setButtonFormData(prev => ({
      ...prev,
      label: template.label,
      variant: template.variant,
      icon: template.icon || '',
      actionType: template.actionType,
      statusMessage: template.statusMessage || '',
      templateName: template.name,
      statusIcon: template.statusIcon,
      statusBackgroundColor: template.statusBackgroundColor
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {step ? 'Schritt bearbeiten' : 'Neuen Schritt erstellen'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Schritt-Titel eingeben"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="z.B. Begrüßung, Authentifizierung"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beschreibung des Schritts"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication">Kommunikation</Label>
            <Textarea
              id="communication"
              value={formData.communication}
              onChange={(e) => handleInputChange('communication', e.target.value)}
              placeholder="Was soll der Agent sagen?"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => handleInputChange('required', checked)}
            />
            <Label htmlFor="required">Pflichtschritt</Label>
          </div>

          {/* Action Buttons Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Aktions-Buttons</Label>
              <Button onClick={handleAddButton} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Button hinzufügen
              </Button>
            </div>
            
            {formData.actionButtons && formData.actionButtons.length > 0 && (
              <div className="space-y-2">
                {formData.actionButtons.map((button, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{button.icon}</span>
                      <div>
                        <div className="font-medium">{button.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {button.actionType} • {button.variant}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditButton(index)}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteButton(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Abbrechen
              </Button>
            )}
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Button Dialog - Simplified version */}
      {showButtonDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingButtonIndex !== null ? 'Button bearbeiten' : 'Neuen Button erstellen'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Button-Text</Label>
                <Input
                  value={buttonFormData.label}
                  onChange={(e) => setButtonFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Button-Text eingeben"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Icon (Emoji)</Label>
                <Input
                  value={buttonFormData.icon || ''}
                  onChange={(e) => setButtonFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="z.B. ✓, ✋, ⚠️"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Button-Typ</Label>
                <Select
                  value={buttonFormData.variant}
                  onValueChange={(value: any) => setButtonFormData(prev => ({ ...prev, variant: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Standard</SelectItem>
                    <SelectItem value="destructive">Fehler/Problem</SelectItem>
                    <SelectItem value="outline">Neutral</SelectItem>
                    <SelectItem value="secondary">Sekundär</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status-Nachricht</Label>
                <Textarea
                  value={buttonFormData.statusMessage || ''}
                  onChange={(e) => setButtonFormData(prev => ({ ...prev, statusMessage: e.target.value }))}
                  placeholder="Was passiert wenn der Button geklickt wird?"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowButtonDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSaveButton}>
                  Speichern
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}