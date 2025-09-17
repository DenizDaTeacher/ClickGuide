import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart3, Download, Workflow, List, Plus, Settings, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCallSteps, CallStep } from "@/hooks/useCallSteps";
import { WorkflowEditor } from "./WorkflowEditor";
import { WorkflowStepEditor } from "./WorkflowStepEditor";

interface EditorModeProps {
  steps: CallStep[];
}

export default function EditorMode({ steps }: EditorModeProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [viewMode, setViewMode] = useState<'workflow' | 'list'>('list');
  const [selectedStep, setSelectedStep] = useState<CallStep | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);
  
  const { saveStep, deleteStep } = useCallSteps();

  const handleAddStep = () => {
    const newStep: Partial<CallStep> = {
      title: "",
      description: "",
      communication: "",
      required: false,
      stepType: "normal",
      category: "",
      subSteps: [],
      nextStepConditions: [],
      positionX: 100,
      positionY: 100,
      isStartStep: false,
      isEndStep: false,
      id: `step-${Date.now()}`
    };
    setSelectedStep(newStep as CallStep);
    setShowStepEditor(true);
  };

  const handleEditStep = (step: CallStep) => {
    setSelectedStep(step);
    setShowStepEditor(true);
  };

  const handleSaveStep = async (step: CallStep) => {
    const isNew = !steps.find(s => s.id === step.id);
    const success = await saveStep(step, isNew);
    if (success) {
      setShowStepEditor(false);
      setSelectedStep(null);
    }
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

    // Steps configuration with workflow data
    const stepsData = [
      ['Schritt', 'Titel', 'Beschreibung', 'Typ', 'Verzweigungen', 'Position X', 'Position Y'],
      ...steps.map((step, index) => [
        index + 1,
        step.title,
        step.description,
        step.stepType,
        step.nextStepConditions.map(c => c.label).join(', '),
        step.positionX,
        step.positionY
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
    XLSX.utils.book_append_sheet(wb, wsSteps, 'Workflow-Konfiguration');

    // Export file
    XLSX.writeFile(wb, `ClickGuide-Workflow-Export-${new Date().toISOString().split('T')[0]}.xlsx`);
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
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-2xl font-semibold">Workflow-Editor</h2>
          <p className="text-muted-foreground">Erstellen Sie komplexe Gesprächsabläufe mit Verzweigungen</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="viewMode"
              checked={viewMode === 'workflow'}
              onCheckedChange={(checked) => setViewMode(checked ? 'workflow' : 'list')}
            />
            <Label htmlFor="viewMode" className="flex items-center space-x-2">
              {viewMode === 'workflow' ? <Workflow className="w-4 h-4" /> : <List className="w-4 h-4" />}
              <span>{viewMode === 'workflow' ? 'Workflow-Ansicht' : 'Listen-Ansicht'}</span>
            </Label>
          </div>
          
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

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'workflow' ? (
          <WorkflowEditor
            steps={steps}
            onSaveStep={saveStep}
            onDeleteStep={deleteStep}
          />
        ) : (
          <div className="p-4 h-full overflow-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Gesprächsschritte bearbeiten</h3>
                <Button onClick={handleAddStep} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Neuen Schritt hinzufügen
                </Button>
              </div>
              
              <div className="space-y-4">
                {steps
                  .filter(step => !step.parentStepId) // Only show main steps, sub-steps are shown within their parent
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((step, index) => (
                    <Card key={step.id} className="shadow-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <h4 className="font-semibold">{step.title}</h4>
                              {step.category && (
                                <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded mt-1 inline-block">
                                  {step.category}
                                </span>
                              )}
                            </div>
                            {step.required && (
                              <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                                Pflicht
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditStep(step)}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteStep(step.id)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        
                        {step.subSteps && step.subSteps.length > 0 && (
                          <div className="ml-4 border-l-2 border-muted pl-4 space-y-2">
                            <h5 className="text-sm font-medium text-muted-foreground">Unterschritte:</h5>
                            {step.subSteps.map((subStep, subIndex) => (
                              <div key={subStep.id} className="text-sm bg-muted/50 rounded p-2">
                                <span className="font-medium">{subIndex + 1}.{index + 1} {subStep.title}</span>
                                {subStep.category && (
                                  <span className="ml-2 text-xs px-2 py-1 bg-background rounded">
                                    {subStep.category}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step Editor Dialog */}
      <Dialog open={showStepEditor} onOpenChange={setShowStepEditor}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStep && steps.find(s => s.id === selectedStep.id) 
                ? "Schritt bearbeiten" 
                : "Neuen Schritt hinzufügen"}
            </DialogTitle>
          </DialogHeader>
          {selectedStep && (
            <WorkflowStepEditor
              step={selectedStep}
              allSteps={steps}
              onSave={handleSaveStep}
              onCancel={() => {
                setShowStepEditor(false);
                setSelectedStep(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

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