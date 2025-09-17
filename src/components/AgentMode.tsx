import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Phone, User, Shield, FileText, Clock, GitBranch } from "lucide-react";
import { CallStep } from "@/hooks/useCallSteps";

interface AgentModeProps {
  steps: CallStep[];
  onStepsUpdate: (steps: CallStep[]) => void;
}

export default function AgentMode({ steps, onStepsUpdate }: AgentModeProps) {
  const [callActive, setCallActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<CallStep | null>(null);
  const [stepHistory, setStepHistory] = useState<CallStep[]>([]);
  const [authenticationFailed, setAuthenticationFailed] = useState(false);

  const completedSteps = stepHistory.length;
  const totalSteps = steps.length;
  const requiredSteps = steps.filter(step => step.required);
  const completedRequiredSteps = stepHistory.filter(step => step.required).length;

  // Find start step or use first step
  const getStartStep = () => {
    return steps.find(step => step.isStartStep) || steps[0];
  };

  const handleStepComplete = (nextStepId?: string) => {
    if (!currentStep) return;
    
    const updatedSteps = steps.map(step => 
      step.id === currentStep.id ? { ...step, completed: true } : step
    );
    onStepsUpdate(updatedSteps);
    
    // Add current step to history
    setStepHistory(prev => [...prev, currentStep]);
    
    // Move to next step
    if (nextStepId) {
      const nextStep = steps.find(step => step.id === nextStepId);
      setCurrentStep(nextStep || null);
    } else {
      // If no specific next step, find next step in sequence
      const currentIndex = steps.indexOf(currentStep);
      const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
      setCurrentStep(nextStep);
    }
  };

  const handleBranchChoice = (nextStepId: string) => {
    if (!currentStep) return;
    
    // Mark current step as completed and add to history
    const updatedSteps = steps.map(step => 
      step.id === currentStep.id ? { ...step, completed: true } : step
    );
    onStepsUpdate(updatedSteps);
    setStepHistory(prev => [...prev, currentStep]);
    
    // Move to selected next step
    const nextStep = steps.find(step => step.id === nextStepId);
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const handleAuthenticationFailure = () => {
    setAuthenticationFailed(true);
  };

  const startCall = () => {
    setCallActive(true);
    const startStep = getStartStep();
    setCurrentStep(startStep);
    setStepHistory([]);
    const resetSteps = steps.map(step => ({ ...step, completed: false }));
    onStepsUpdate(resetSteps);
    setAuthenticationFailed(false);
  };

  const endCall = () => {
    setCallActive(false);
    setCurrentStep(null);
    setStepHistory([]);
    const resetSteps = steps.map(step => ({ ...step, completed: false }));
    onStepsUpdate(resetSteps);
    setAuthenticationFailed(false);
  };

  const canProceed = completedRequiredSteps === requiredSteps.length && !authenticationFailed;

  return (
    <div className="space-y-6">
      {/* Call Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant={callActive ? "default" : "secondary"} className="text-sm">
            <Phone className="w-4 h-4 mr-2" />
            {callActive ? "Gespräch aktiv" : "Bereit"}
          </Badge>
        </div>
        {!callActive ? (
          <Button onClick={startCall} className="bg-gradient-primary">
            Gespräch starten
          </Button>
        ) : (
          <Button onClick={endCall} variant="destructive">
            Gespräch beenden
          </Button>
        )}
      </div>

      {callActive && (
        <div className="bg-gradient-card p-4 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Fortschritt</span>
            <span className="text-sm font-medium">{completedSteps} Schritte durchlaufen</span>
          </div>
          <Progress value={completedSteps > 0 ? (completedSteps / (completedSteps + 1)) * 100 : 0} className="h-2" />
        </div>
      )}

      {callActive && currentStep && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Step */}
          <div className="lg:col-span-2">
            <Card className="shadow-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {currentStep.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    {currentStep.required && (
                      <Badge variant="destructive">Pflicht</Badge>
                    )}
                    {currentStep.stepType !== 'normal' && (
                      <Badge variant="outline">{currentStep.stepType}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Was zu tun ist:
                  </h3>
                  <p className="text-muted-foreground">{currentStep.description}</p>
                </div>
                
                <div className="bg-gradient-card p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Kommunikationsvorlage:
                  </h3>
                  <p className="italic text-foreground">{currentStep.communication}</p>
                </div>

                {/* Branch Options */}
                {currentStep.nextStepConditions.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center">
                      <GitBranch className="w-4 h-4 mr-2" />
                      Wählen Sie den nächsten Schritt:
                    </h3>
                    <div className="grid gap-2">
                      {currentStep.nextStepConditions.map((condition, index) => (
                        <Button
                          key={index}
                          onClick={() => handleBranchChoice(condition.nextStepId)}
                          variant="outline"
                          className="justify-start h-auto p-4"
                        >
                          <div className="text-left">
                            <div className="font-medium">{condition.label}</div>
                            {condition.condition && (
                              <div className="text-sm text-muted-foreground">{condition.condition}</div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => handleStepComplete()}
                      className="bg-gradient-primary"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Schritt abgeschlossen
                    </Button>
                    
                    {currentStep.stepType === 'decision' && (
                      <Button 
                        variant="destructive"
                        onClick={handleAuthenticationFailure}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Problem aufgetreten
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress Sidebar */}
          <div className="space-y-6">
            {/* Status Overview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Status Übersicht
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pflichtschritte:</span>
                  <Badge variant={canProceed ? "default" : "destructive"}>
                    {completedRequiredSteps}/{requiredSteps.length}
                  </Badge>
                </div>
                
                {authenticationFailed && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ Authentifizierung fehlgeschlagen
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      Gespräch muss beendet werden
                    </p>
                  </div>
                )}
                
                {canProceed && completedRequiredSteps === requiredSteps.length && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success font-medium">
                      ✅ Alle Pflichtschritte abgeschlossen
                    </p>
                    <p className="text-xs text-success/80 mt-1">
                      Gespräch kann fortgesetzt werden
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step History */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Durchlaufene Schritte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stepHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Noch keine Schritte abgeschlossen</p>
                  ) : (
                    stepHistory.map((step, index) => (
                      <div 
                        key={`${step.id}-${index}`}
                        className="flex items-center space-x-3 p-2 rounded-lg bg-success/5 border border-success/20"
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-success text-success-foreground">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-success">
                            {step.title}
                          </p>
                          {step.required && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Pflicht
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  
                  {currentStep && (
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                        <span className="text-xs font-bold">▶</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">
                          {currentStep.title} (Aktuell)
                        </p>
                        {currentStep.required && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Pflicht
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!callActive && (
        <Card className="shadow-elevated">
          <CardContent className="p-12 text-center">
            <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Bereit für den nächsten Anruf</h2>
            <p className="text-muted-foreground mb-6">
              Klicken Sie auf "Gespräch starten" um den konfigurierten Workflow zu durchlaufen
            </p>
            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-6">
                Keine Schritte konfiguriert. Wechseln Sie zum Editor-Modus um Schritte zu erstellen.
              </p>
            ) : (
              <Button onClick={startCall} size="lg" className="bg-gradient-primary">
                <Phone className="w-5 h-5 mr-2" />
                Gespräch starten
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {callActive && !currentStep && (
        <Card className="shadow-elevated">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Workflow abgeschlossen</h2>
            <p className="text-muted-foreground mb-6">
              Alle konfigurierten Schritte wurden durchlaufen
            </p>
            <Button onClick={endCall} size="lg" variant="outline">
              Gespräch beenden
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}