import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CallStep, NextStepCondition, ActionButton } from "@/hooks/useCallSteps";
import { Plus, Trash2, Settings, MousePointer } from "lucide-react";

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
    actionButtons: step.actionButtons || []
  });

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

  const addActionButton = () => {
    const newButton: ActionButton = {
      id: `action-${Date.now()}`,
      label: "Neuer Button",
      variant: "outline",
      actionType: "info",
      statusMessage: "",
      icon: ""
    };
    setEditedStep({
      ...editedStep,
      actionButtons: [...(editedStep.actionButtons || []), newButton]
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
            <Button onClick={addActionButton} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Button hinzufügen
            </Button>
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
                    <h4 className="font-medium flex items-center">
                      <MousePointer className="w-4 h-4 mr-2" />
                      Button {index + 1}
                    </h4>
                    <Button 
                      onClick={() => removeActionButton(index)} 
                      variant="destructive" 
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={button.label}
                        onChange={(e) => updateActionButton(index, 'label', e.target.value)}
                        placeholder="z.B. Problem aufgetreten"
                      />
                    </div>
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label>Icon (optional)</Label>
                      <Input
                        value={button.icon || ''}
                        onChange={(e) => updateActionButton(index, 'icon', e.target.value)}
                        placeholder="z.B. AlertCircle, Info, CheckCircle"
                      />
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