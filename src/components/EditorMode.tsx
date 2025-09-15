import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, BarChart3, Download, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCallSteps, CallStep } from "@/hooks/useCallSteps";

interface EditorModeProps {
  steps: CallStep[];
}

export default function EditorMode({ steps }: EditorModeProps) {
  const [editingStep, setEditingStep] = useState<CallStep | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newStep, setNewStep] = useState<Partial<CallStep>>({
    title: "",
    description: "",
    communication: "",
    required: false
  });
  
  const { saveStep, deleteStep } = useCallSteps();

  const handleSaveStep = async (step: CallStep) => {
    const isNew = !editingStep;
    const stepToSave = isNew ? {
      ...step,
      id: `step-${Date.now()}`,
      completed: false
    } : step;

    const success = await saveStep(stepToSave, isNew);
    if (success) {
      setEditingStep(null);
      setNewStep({ title: "", description: "", communication: "", required: false });
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    await deleteStep(stepId);
  };

  const exportConfiguration = async () => {
    const XLSX = await import('xlsx');
    
    // Statistics data
    const statsData = [
      ['Statistik', 'Wert'],
      ['Gesamte Anrufe', mockAnalytics.totalCalls],
      ['Authentifizierungsfehler', mockAnalytics.authFailures],
      ['Durchschnittliche Gesprächsdauer', mockAnalytics.averageCallDuration],
      ['Abschlussrate (%)', mockAnalytics.completionRate],
      ['Meist übersprungener Schritt', mockAnalytics.mostSkippedStep],
      ['Hauptverkehrszeit', mockAnalytics.peakHours],
    ];

    // Call breakdown data
    const callBreakdownData = [
      ['Abbruchgrund', 'Anzahl', 'Schritt'],
      ['Authentifizierung fehlgeschlagen', 12, 'Kundenidentifikation'],
      ['Kunde aufgelegt', 8, 'Datenschutz'],
      ['Zeitüberschreitung', 5, 'Anliegen erfassen'],
      ['Technischer Fehler', 3, 'Datenverifikation'],
      ['Erfolgreich abgeschlossen', 119, 'Abschluss'],
    ];

    // Steps configuration
    const stepsData = [
      ['Schritt', 'Titel', 'Beschreibung', 'Kommunikation', 'Pflicht'],
      ...steps.map((step, index) => [
        index + 1,
        step.title,
        step.description,
        step.communication,
        step.required ? 'Ja' : 'Nein'
      ])
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add worksheets
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    const wsBreakdown = XLSX.utils.aoa_to_sheet(callBreakdownData);
    const wsSteps = XLSX.utils.aoa_to_sheet(stepsData);
    
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiken');
    XLSX.utils.book_append_sheet(wb, wsBreakdown, 'Anruf-Analyse');
    XLSX.utils.book_append_sheet(wb, wsSteps, 'Schritte-Konfiguration');

    // Export file
    XLSX.writeFile(wb, `ClickGuide-Export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const mockAnalytics = {
    totalCalls: 147,
    authFailures: 12,
    averageCallDuration: "4:32",
    completionRate: 89,
    mostSkippedStep: "Datenschutz",
    peakHours: "10:00-12:00",
    callsAbortedAtStep: {
      "Kundenidentifikation": 12,
      "Datenschutz": 8,
      "Anliegen erfassen": 5,
      "Datenverifikation": 3
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Prozess-Editor</h2>
          <p className="text-muted-foreground">Verwalten Sie Ihre Gesprächsabläufe ohne Code</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowAnalytics(true)} variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={exportConfiguration} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Steps Management */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gesprächsschritte verwalten</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Neuer Schritt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Neuen Schritt hinzufügen</DialogTitle>
                </DialogHeader>
                <StepEditor 
                  step={newStep as CallStep}
                  onSave={handleSaveStep}
                  onCancel={() => setNewStep({ title: "", description: "", communication: "", required: false })}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <h3 className="font-semibold">{step.title}</h3>
                    {step.required && (
                      <Badge variant="destructive" className="text-xs">Pflicht</Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingStep(step)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Schritt bearbeiten</DialogTitle>
                        </DialogHeader>
                        <StepEditor 
                          step={step}
                          onSave={handleSaveStep}
                          onCancel={() => setEditingStep(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteStep(step.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm italic">"{step.communication}"</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Analytics & Export</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{mockAnalytics.totalCalls}</div>
                <div className="text-sm text-muted-foreground">Gesamte Anrufe</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-destructive">{mockAnalytics.authFailures}</div>
                <div className="text-sm text-muted-foreground">Auth-Fehler</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{mockAnalytics.averageCallDuration}</div>
                <div className="text-sm text-muted-foreground">Ø Gesprächsdauer</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-success">{mockAnalytics.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Abschlussrate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">{mockAnalytics.mostSkippedStep}</div>
                <div className="text-sm text-muted-foreground">Meist übersprungen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">{mockAnalytics.peakHours}</div>
                <div className="text-sm text-muted-foreground">Hauptverkehrszeit</div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StepEditorProps {
  step: CallStep;
  onSave: (step: CallStep) => void;
  onCancel: () => void;
}

function StepEditor({ step, onSave, onCancel }: StepEditorProps) {
  const [editedStep, setEditedStep] = useState<CallStep>(step);

  const handleSave = () => {
    if (editedStep.title && editedStep.description && editedStep.communication) {
      onSave(editedStep);
    }
  };

  return (
    <div className="space-y-4">
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
      
      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={editedStep.required}
          onCheckedChange={(checked) => setEditedStep({ ...editedStep, required: checked })}
        />
        <Label htmlFor="required">Pflichtschritt</Label>
      </div>
      
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