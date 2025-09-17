import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CallStep, NextStepCondition, ActionButton, useCallSteps } from "@/hooks/useCallSteps";
import { Plus, Trash2, Settings, MousePointer, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStepEditorProps {
  step: CallStep;
  allSteps: CallStep[];
  onSave: (step: CallStep) => void;
  onCancel: () => void;
}

export function WorkflowStepEditor({ step, allSteps, onSave, onCancel }: WorkflowStepEditorProps) {
  const [editedStep, setEditedStep] = useState<CallStep>({
    ...step,
    subSteps: step.subSteps || [],
    category: step.category || "",
    actionButtons: step.actionButtons || [],
    statusBackgroundColor: step.statusBackgroundColor || "",
    statusIcon: step.statusIcon || ""
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [saveAsTemplate, setSaveAsTemplate] = useState<boolean>(false);
  const [currentButtonIndex, setCurrentButtonIndex] = useState<number>(-1);

  const { 
    buttonTemplates, 
    saveButtonTemplate, 
    deleteButtonTemplate 
  } = useCallSteps();
  
  const { toast } = useToast();

  const handleSave = () => {
    if (editedStep.title && editedStep.description && editedStep.communication) {
      onSave(editedStep);
    }
  };

  const addCondition = () => {
    const newCondition: NextStepCondition = {
      condition: "",
      nextStepId: "",
      label: "Neue Bedingung"
    };
    setEditedStep({
      ...editedStep,
      nextStepConditions: [...editedStep.nextStepConditions, newCondition]
    });
  };

  const removeCondition = (index: number) => {
    const conditions = [...editedStep.nextStepConditions];
    conditions.splice(index, 1);
    setEditedStep({
      ...editedStep,
      nextStepConditions: conditions
    });
  };

  const updateCondition = (index: number, field: keyof NextStepCondition, value: string) => {
    const conditions = [...editedStep.nextStepConditions];
    conditions[index] = { ...conditions[index], [field]: value };
    setEditedStep({
      ...editedStep,
      nextStepConditions: conditions
    });
  };

  // Add new action button
  const addActionButton = () => {
    if (selectedTemplate && buttonTemplates.length > 0) {
      // Create button from template
      const template = buttonTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        const newButton: ActionButton = {
          id: crypto.randomUUID(),
          label: template.label,
          variant: template.variant,
          actionType: template.actionType,
          icon: template.icon,
          statusMessage: template.statusMessage,
          enabled: true,
          templateName: template.name
        };
        setEditedStep({
          ...editedStep,
          actionButtons: [...(editedStep.actionButtons || []), newButton]
        });
        setSelectedTemplate('');
        return;
      }
    }
    
    // Create new custom button
    const newButton: ActionButton = {
      id: crypto.randomUUID(),
      label: `Button ${(editedStep.actionButtons?.length || 0) + 1}`,
      variant: 'default',
      actionType: 'custom',
      enabled: true,
      templateName: `Button ${(editedStep.actionButtons?.length || 0) + 1}`
    };
    setEditedStep({
      ...editedStep,
      actionButtons: [...(editedStep.actionButtons || []), newButton]
    });
  };

  const toggleActionButton = (index: number) => {
    const buttons = [...(editedStep.actionButtons || [])];
    buttons[index] = { ...buttons[index], enabled: !buttons[index].enabled };
    setEditedStep({
      ...editedStep,
      actionButtons: buttons
    });
  };

  const updateActionButton = (index: number, field: keyof ActionButton, value: any) => {
    const buttons = [...(editedStep.actionButtons || [])];
    buttons[index] = { ...buttons[index], [field]: value };
    setEditedStep({
      ...editedStep,
      actionButtons: buttons
    });
  };

  const removeActionButton = (index: number) => {
    const buttons = [...(editedStep.actionButtons || [])];
    buttons.splice(index, 1);
    setEditedStep({
      ...editedStep,
      actionButtons: buttons
    });
  };

  // Save button as template
  const handleSaveAsTemplate = async (button: ActionButton) => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen für die Vorlage ein",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveButtonTemplate({
        name: newTemplateName,
        label: button.label,
        variant: button.variant,
        icon: button.icon,
        actionType: button.actionType,
        statusMessage: button.statusMessage
      });
      
      // Update button with template name
      const updatedButtons = editedStep.actionButtons?.map(b => 
        b.id === button.id ? { ...b, templateName: newTemplateName } : b
      ) || [];
      
      setEditedStep({
        ...editedStep,
        actionButtons: updatedButtons
      });
      
      setNewTemplateName('');
      setSaveAsTemplate(false);
      setCurrentButtonIndex(-1);
      
      toast({
        title: "Erfolg",
        description: "Button-Vorlage wurde gespeichert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Button-Vorlage konnte nicht gespeichert werden",
        variant: "destructive"
      });
    }
  };

  const commonEmojis = [
    '✅', '❌', '⚠️', '🔄', '📞', '✉️', '📋', '🔍', '💡', '⭐',
    '🎯', '🚀', '💼', '📊', '🛠️', '🎨', '📝', '💬', '🔔', '🎉',
    '🏆', '⚡', '🔒', '🔓', '📤', '📥', '🎮', '🏠', '👤', '⚙️'
  ];

  const statusColors = [
    { name: 'Standard', value: '' },
    { name: 'Blau', value: 'bg-blue-500' },
    { name: 'Grün', value: 'bg-green-500' },
    { name: 'Gelb', value: 'bg-yellow-500' },
    { name: 'Rot', value: 'bg-red-500' },
    { name: 'Lila', value: 'bg-purple-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Grau', value: 'bg-gray-500' }
  ];

  const availableNextSteps = allSteps.filter(s => s.id !== editedStep.id);

  const addSubStep = () => {
    const newSubStep: CallStep = {
      id: `sub-step-${Date.now()}`,
      title: "",
      description: "",
      communication: "",
      completed: false,
      required: false,
      sortOrder: (editedStep.subSteps?.length || 0) + 1,
      stepType: "sub_step",
      nextStepConditions: [],
      positionX: 0,
      positionY: 0,
      isStartStep: false,
      isEndStep: false,
      parentStepId: editedStep.id,
      category: ""
    };
    
    setEditedStep({
      ...editedStep,
      subSteps: [...(editedStep.subSteps || []), newSubStep]
    });
  };

  const updateSubStep = (subStepIndex: number, field: keyof CallStep, value: any) => {
    const updatedSubSteps = [...(editedStep.subSteps || [])];
    updatedSubSteps[subStepIndex] = {
      ...updatedSubSteps[subStepIndex],
      [field]: value
    };
    
    setEditedStep({
      ...editedStep,
      subSteps: updatedSubSteps
    });
  };

  const removeSubStep = (subStepIndex: number) => {
    const updatedSubSteps = [...(editedStep.subSteps || [])];
    updatedSubSteps.splice(subStepIndex, 1);
    
    setEditedStep({
      ...editedStep,
      subSteps: updatedSubSteps
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Schritt-Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={editedStep.title}
                onChange={(e) => setEditedStep({ ...editedStep, title: e.target.value })}
                placeholder="Schritt-Titel eingeben"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Kategorie/Label</Label>
              <Input
                id="category"
                value={editedStep.category || ''}
                onChange={(e) => setEditedStep({...editedStep, category: e.target.value})}
                placeholder="z.B. Wichtig, Optional, Verkauf, Support..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={editedStep.description}
              onChange={(e) => setEditedStep({ ...editedStep, description: e.target.value })}
              placeholder="Was soll in diesem Schritt getan werden?"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="communication">Kommunikationsvorlage</Label>
            <Textarea
              id="communication"
              value={editedStep.communication}
              onChange={(e) => setEditedStep({ ...editedStep, communication: e.target.value })}
              placeholder="Was soll dem Kunden gesagt werden?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stepType">Schritt-Typ</Label>
              <Select
                value={editedStep.stepType}
                onValueChange={(value: CallStep['stepType']) => 
                  setEditedStep({ ...editedStep, stepType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="decision">Entscheidung</SelectItem>
                  <SelectItem value="condition">Bedingung</SelectItem>
                  <SelectItem value="sub_step">Unterschritt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {editedStep.stepType === 'condition' && (
              <div>
                <Label htmlFor="conditionLabel">Bedingungstext</Label>
                <Input
                  id="conditionLabel"
                  value={editedStep.conditionLabel || ""}
                  onChange={(e) => setEditedStep({ ...editedStep, conditionLabel: e.target.value })}
                  placeholder="z.B. 'Was ist das Kundenanliegen?'"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Schritt-Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={editedStep.required}
                onCheckedChange={(checked) => setEditedStep({ ...editedStep, required: checked })}
              />
              <Label htmlFor="required">Pflichtschritt</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isStartStep"
                checked={editedStep.isStartStep}
                onCheckedChange={(checked) => setEditedStep({ ...editedStep, isStartStep: checked })}
              />
              <Label htmlFor="isStartStep">Startschritt</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isEndStep"
                checked={editedStep.isEndStep}
                onCheckedChange={(checked) => setEditedStep({ ...editedStep, isEndStep: checked })}
              />
              <Label htmlFor="isEndStep">Endschritt</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status-Übersicht Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle>Status-Übersicht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status-Icon</Label>
              <div className="flex gap-2">
                <Input
                  value={editedStep.statusIcon || ''}
                  onChange={(e) => setEditedStep({...editedStep, statusIcon: e.target.value})}
                  placeholder="Emoji auswählen..."
                  className="flex-1"
                />
              </div>
              <div className="grid grid-cols-10 gap-1 mt-2">
                {commonEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-base hover:bg-accent"
                    onClick={() => setEditedStep({...editedStep, statusIcon: emoji})}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Hintergrundfarbe</Label>
              <Select
                value={editedStep.statusBackgroundColor || ''}
                onValueChange={(value) => setEditedStep({...editedStep, statusBackgroundColor: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Farbe auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {statusColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-4 h-4 rounded ${color.value || 'bg-muted'}`}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Status Preview */}
          <div className="bg-muted p-3 rounded-md">
            <Label className="text-sm font-medium">Vorschau:</Label>
            <div className={`mt-2 p-2 rounded border ${editedStep.statusBackgroundColor || 'bg-background'}`}>
              <div className="flex items-center gap-2">
                {editedStep.statusIcon && <span>{editedStep.statusIcon}</span>}
                <span className="font-medium">{editedStep.title || "Schritt Titel"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Steps Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unterschritte</CardTitle>
            <Button onClick={addSubStep} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Unterschritt hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editedStep.subSteps && editedStep.subSteps.length > 0 ? (
            editedStep.subSteps.map((subStep, index) => (
              <Card key={subStep.id} className="border-muted">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Unterschritt {index + 1}</h4>
                    <Button 
                      onClick={() => removeSubStep(index)} 
                      variant="destructive" 
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Titel</Label>
                      <Input
                        value={subStep.title}
                        onChange={(e) => updateSubStep(index, 'title', e.target.value)}
                        placeholder="Unterschritt-Titel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kategorie</Label>
                      <Input
                        value={subStep.category || ''}
                        onChange={(e) => updateSubStep(index, 'category', e.target.value)}
                        placeholder="Kategorie für diesen Unterschritt"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={subStep.description}
                      onChange={(e) => updateSubStep(index, 'description', e.target.value)}
                      placeholder="Was soll in diesem Unterschritt getan werden?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Kommunikation</Label>
                    <Textarea
                      value={subStep.communication}
                      onChange={(e) => updateSubStep(index, 'communication', e.target.value)}
                      placeholder="Was soll dem Kunden kommuniziert werden?"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`required-${index}`}
                      checked={subStep.required}
                      onCheckedChange={(checked) => updateSubStep(index, 'required', checked)}
                    />
                    <Label htmlFor={`required-${index}`}>Pflichtschritt</Label>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Keine Unterschritte vorhanden. Klicken Sie auf "Unterschritt hinzufügen", um einen neuen zu erstellen.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Workflow Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workflow-Navigation</CardTitle>
            <Button onClick={addCondition} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Verzweigung hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editedStep.nextStepConditions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Keine Verzweigungen konfiguriert. Fügen Sie Bedingungen hinzu um verschiedene Pfade zu erstellen.
            </p>
          ) : (
            <div className="space-y-4">
              {editedStep.nextStepConditions.map((condition, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">Verzweigung {index + 1}</span>
                    <Button
                      onClick={() => removeCondition(index)}
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Bedingungstext</Label>
                      <Input
                        value={condition.label}
                        onChange={(e) => updateCondition(index, 'label', e.target.value)}
                        placeholder="z.B. 'Technische Anfrage'"
                      />
                    </div>
                    
                    <div>
                      <Label>Bedingung</Label>
                      <Input
                        value={condition.condition}
                        onChange={(e) => updateCondition(index, 'condition', e.target.value)}
                        placeholder="Logische Bedingung (optional)"
                      />
                    </div>
                    
                    <div>
                      <Label>Nächster Schritt</Label>
                      <Select
                        value={condition.nextStepId}
                        onValueChange={(value) => updateCondition(index, 'nextStepId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Schritt auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableNextSteps.map((nextStep) => (
                            <SelectItem key={nextStep.id} value={nextStep.id}>
                              {nextStep.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Aktions-Buttons</CardTitle>
            <div className="flex gap-2">
              {/* Template Selection */}
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Vorlage auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {buttonTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {template.icon && <span>{template.icon}</span>}
                        {template.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={addActionButton} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {selectedTemplate ? 'Vorlage hinzufügen' : 'Neuer Button'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Der "Schritt abgeschlossen" Button ist immer vorhanden. Hier können Sie zusätzliche Buttons konfigurieren.
          </div>
          
          {editedStep.actionButtons && editedStep.actionButtons.length > 0 ? (
            editedStep.actionButtons.map((button, index) => (
              <Card key={button.id} className="border-muted">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium flex items-center">
                        <MousePointer className="w-4 h-4 mr-2" />
                        {button.templateName || `Button ${index + 1}`}
                      </h4>
                      <Switch
                        checked={button.enabled !== false}
                        onCheckedChange={() => toggleActionButton(index)}
                      />
                    </div>
                    <div className="flex gap-2">
                      {/* Save as Template */}
                      {!button.templateName && (
                        <Button 
                          onClick={() => {
                            setSaveAsTemplate(true);
                            setCurrentButtonIndex(index);
                          }} 
                          variant="outline" 
                          size="sm"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        onClick={() => removeActionButton(index)} 
                        variant="destructive" 
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Button Preview */}
                  <div className="bg-muted p-3 rounded-md">
                    <Label className="text-sm font-medium">Vorschau:</Label>
                    <div className="mt-2">
                      <Button 
                        variant={button.variant}
                        size="sm"
                        className="pointer-events-none"
                        disabled={button.enabled === false}
                      >
                        {button.icon && <span className="mr-2">{button.icon}</span>}
                        {button.label || "Button Text"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Name</Label>
                      <Input
                        value={button.templateName || `Button ${index + 1}`}
                        onChange={(e) => updateActionButton(index, 'templateName', e.target.value)}
                        placeholder="z.B. Problem Button"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={button.label}
                        onChange={(e) => updateActionButton(index, 'label', e.target.value)}
                        placeholder="z.B. Problem aufgetreten"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Stil</Label>
                      <Select
                        value={button.variant}
                        onValueChange={(value: ActionButton['variant']) => 
                          updateActionButton(index, 'variant', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Standard</SelectItem>
                          <SelectItem value="destructive">Rot (Fehler)</SelectItem>
                          <SelectItem value="outline">Umrandet</SelectItem>
                          <SelectItem value="secondary">Sekundär</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Aktions-Typ</Label>
                      <Select
                        value={button.actionType}
                        onValueChange={(value: ActionButton['actionType']) => 
                          updateActionButton(index, 'actionType', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="complete">Schritt abschließen</SelectItem>
                          <SelectItem value="fail">Fehler/Problem</SelectItem>
                          <SelectItem value="info">Info anzeigen</SelectItem>
                          <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="flex gap-2">
                      <Input
                        value={button.icon || ''}
                        onChange={(e) => updateActionButton(index, 'icon', e.target.value)}
                        placeholder="Emoji auswählen..."
                        className="flex-1"
                      />
                    </div>
                    <div className="grid grid-cols-10 gap-1 mt-2">
                      {commonEmojis.map((emoji) => (
                        <Button
                          key={emoji}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-base hover:bg-accent"
                          onClick={() => updateActionButton(index, 'icon', emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status-Nachricht</Label>
                    <Textarea
                      value={button.statusMessage || ''}
                      onChange={(e) => updateActionButton(index, 'statusMessage', e.target.value)}
                      placeholder="Diese Nachricht wird in der Status-Übersicht angezeigt"
                      rows={2}
                    />
                  </div>
                  
                  {/* Save as Template Dialog */}
                  {saveAsTemplate && currentButtonIndex === index && (
                    <div className="border-t pt-4 mt-4">
                      <div className="space-y-3">
                        <Label>Als Vorlage speichern</Label>
                        <div className="flex gap-2">
                          <Input
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Vorlagen-Name eingeben..."
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => handleSaveAsTemplate(button)}
                            size="sm"
                          >
                            Speichern
                          </Button>
                          <Button 
                            onClick={() => {
                              setSaveAsTemplate(false);
                              setNewTemplateName('');
                              setCurrentButtonIndex(-1);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Keine zusätzlichen Buttons konfiguriert. Der Standard "Schritt abgeschlossen" Button ist immer verfügbar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={handleSave} className="bg-gradient-primary">
          <Settings className="w-4 h-4 mr-2" />
          Speichern
        </Button>
      </div>
    </div>
  );
}