import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CallStep, NextStepCondition, ActionButton, ButtonTemplate } from "@/hooks/useCallSteps";
import { Plus, Trash2, Settings, MousePointer, Save, ChevronDown, ChevronRight, Palette, Star, Copy, Edit } from "lucide-react";
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
  
  // Sub-steps management
  const [showSubStepDialog, setShowSubStepDialog] = useState(false);
  const [editingSubStepIndex, setEditingSubStepIndex] = useState<number | null>(null);
  const [subStepFormData, setSubStepFormData] = useState<Partial<CallStep>>({});
  
  // Collapsible sections state
  const [isSubStepsOpen, setIsSubStepsOpen] = useState(true);
  const [isButtonsOpen, setIsButtonsOpen] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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

  // Sub-step management functions
  const handleAddSubStep = () => {
    setEditingSubStepIndex(null);
    setSubStepFormData({
      id: `substep-${Date.now()}`,
      title: '',
      description: '',
      communication: '',
      stepType: 'sub_step',
      required: false,
      category: '',
      parentStepId: formData.id,
      workflowName: formData.workflowName,
      actionButtons: []
    });
    setShowSubStepDialog(true);
  };

  const handleEditSubStep = (index: number) => {
    const subStep = formData.subSteps?.[index];
    if (subStep) {
      setEditingSubStepIndex(index);
      setSubStepFormData({ ...subStep });
      setShowSubStepDialog(true);
    }
  };

  const handleSaveSubStep = () => {
    const updatedSubSteps = [...(formData.subSteps || [])];
    
    if (editingSubStepIndex !== null) {
      updatedSubSteps[editingSubStepIndex] = subStepFormData as CallStep;
    } else {
      updatedSubSteps.push(subStepFormData as CallStep);
    }
    
    setFormData(prev => ({ ...prev, subSteps: updatedSubSteps }));
    setShowSubStepDialog(false);
  };

  const handleDeleteSubStep = (index: number) => {
    const updatedSubSteps = formData.subSteps?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, subSteps: updatedSubSteps }));
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

          {/* Sub-Steps Section */}
          <Collapsible open={isSubStepsOpen} onOpenChange={setIsSubStepsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0">
                <div className="flex items-center space-x-2">
                  <Label className="text-base font-medium">Unterschritte</Label>
                  <Badge variant="secondary">{formData.subSteps?.length || 0}</Badge>
                </div>
                {isSubStepsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Unterschritte werden als untergeordnete Aufgaben angezeigt
                </p>
                <Button onClick={handleAddSubStep} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Unterschritt hinzufügen
                </Button>
              </div>
              
              {formData.subSteps && formData.subSteps.length > 0 && (
                <div className="space-y-2">
                  {formData.subSteps.map((subStep, index) => (
                    <Card key={index} className="border-l-4 border-l-primary/30">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{subStep.title}</div>
                            <div className="text-xs text-muted-foreground">{subStep.description}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditSubStep(index)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSubStep(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

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

      {/* Enhanced Button Dialog */}
      {showButtonDialog && (
        <Dialog open={showButtonDialog} onOpenChange={setShowButtonDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingButtonIndex !== null ? 'Button bearbeiten' : 'Neuen Button erstellen'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Template Selection */}
              {buttonTemplates.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Vorlagen verwenden</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {buttonTemplates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyTemplate(template)}
                        className="justify-start text-left h-auto p-2"
                      >
                        <div>
                          <div className="font-medium text-xs">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.label}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <Separator />
                </div>
              )}

              {/* Basic Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button-Text *</Label>
                  <Input
                    value={buttonFormData.label}
                    onChange={(e) => setButtonFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Button-Text eingeben"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Icon (Emoji)</Label>
                  <Input
                    value={buttonFormData.icon || ''}
                    onChange={(e) => setButtonFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="z.B. ✓, ✋, ⚠️, 📞"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Aktion</Label>
                  <Select
                    value={buttonFormData.actionType}
                    onValueChange={(value: any) => setButtonFormData(prev => ({ ...prev, actionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Schritt abschließen</SelectItem>
                      <SelectItem value="next">Zum nächsten Schritt</SelectItem>
                      <SelectItem value="skip">Schritt überspringen</SelectItem>
                      <SelectItem value="restart">Neu starten</SelectItem>
                      <SelectItem value="pause">Pausieren</SelectItem>
                      <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Configuration */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Status-Konfiguration</Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Status-Nachricht</Label>
                    <Textarea
                      value={buttonFormData.statusMessage || ''}
                      onChange={(e) => setButtonFormData(prev => ({ ...prev, statusMessage: e.target.value }))}
                      placeholder="Was passiert wenn der Button geklickt wird?"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status Icon</Label>
                      <Input
                        value={buttonFormData.statusIcon || ''}
                        onChange={(e) => setButtonFormData(prev => ({ ...prev, statusIcon: e.target.value }))}
                        placeholder="z.B. ✅, ⏸️, 🔄"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Status Hintergrundfarbe</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          value={buttonFormData.statusBackgroundColor || '#ffffff'}
                          onChange={(e) => setButtonFormData(prev => ({ ...prev, statusBackgroundColor: e.target.value }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={buttonFormData.statusBackgroundColor || ''}
                          onChange={(e) => setButtonFormData(prev => ({ ...prev, statusBackgroundColor: e.target.value }))}
                          placeholder="#ffffff oder transparent"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Management */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span>Als Vorlage speichern</span>
                    <Star className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="space-y-2">
                    <Label>Vorlagen-Name</Label>
                    <Input
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Name für die Vorlage eingeben"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSaveTemplate(buttonFormData)}
                    disabled={!newTemplateName.trim()}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Als Vorlage speichern
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowButtonDialog(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSaveButton}
                  disabled={!buttonFormData.label.trim()}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Speichern
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Sub-Step Dialog */}
      {showSubStepDialog && (
        <Dialog open={showSubStepDialog} onOpenChange={setShowSubStepDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSubStepIndex !== null ? 'Unterschritt bearbeiten' : 'Neuen Unterschritt erstellen'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titel *</Label>
                  <Input
                    value={subStepFormData.title || ''}
                    onChange={(e) => setSubStepFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Unterschritt-Titel"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Input
                    value={subStepFormData.category || ''}
                    onChange={(e) => setSubStepFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="z.B. Verifikation, Check"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={subStepFormData.description || ''}
                  onChange={(e) => setSubStepFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreibung des Unterschritts"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Kommunikation</Label>
                <Textarea
                  value={subStepFormData.communication || ''}
                  onChange={(e) => setSubStepFormData(prev => ({ ...prev, communication: e.target.value }))}
                  placeholder="Was soll bei diesem Unterschritt gesagt werden?"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="subStepRequired"
                  checked={subStepFormData.required || false}
                  onCheckedChange={(checked) => setSubStepFormData(prev => ({ ...prev, required: checked }))}
                />
                <Label htmlFor="subStepRequired">Pflicht-Unterschritt</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowSubStepDialog(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSaveSubStep}
                  disabled={!subStepFormData.title?.trim()}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Speichern
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}