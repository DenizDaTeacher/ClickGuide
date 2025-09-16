import { useState } from "react";
import { CallStep } from "@/hooks/useCallSteps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface WorkflowStepEditorProps {
  step: CallStep;
  allSteps: CallStep[];
  onSave: (step: CallStep) => void;
  onCancel: () => void;
}

export function WorkflowStepEditor({ step, allSteps, onSave, onCancel }: WorkflowStepEditorProps) {
  const [editedStep, setEditedStep] = useState<CallStep>(step);

  const handleSave = () => {
    if (editedStep.title && editedStep.description && editedStep.communication) {
      onSave(editedStep);
    }
  };

  const addCondition = () => {
    const newCondition = {
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

  const updateCondition = (index: number, field: string, value: string) => {
    const conditions = [...editedStep.nextStepConditions];
    conditions[index] = { ...conditions[index], [field]: value };
    setEditedStep({
      ...editedStep,
      nextStepConditions: conditions
    });
  };

  // Filter out current step and parent steps to prevent circular references
  const availableNextSteps = allSteps.filter(s => 
    s.id !== editedStep.id && 
    s.parentStepId !== editedStep.id
  );

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
                    <Badge variant="outline">Verzweigung {index + 1}</Badge>
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

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={handleSave} className="bg-gradient-primary">
          <Save className="w-4 h-4 mr-2" />
          Speichern
        </Button>
      </div>
    </div>
  );
}