import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Phone, User, Shield, FileText, Clock } from "lucide-react";
import { CallStep } from "@/hooks/useCallSteps";

interface AgentModeProps {
  steps: CallStep[];
  onStepsUpdate: (steps: CallStep[]) => void;
}

export default function AgentMode({ steps, onStepsUpdate }: AgentModeProps) {
  const [callActive, setCallActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [authenticationFailed, setAuthenticationFailed] = useState(false);

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const requiredSteps = steps.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed).length;

  const handleStepComplete = (stepId: string) => {
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    );
    onStepsUpdate(updatedSteps);
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleAuthenticationFailure = () => {
    setAuthenticationFailed(true);
  };

  const startCall = () => {
    setCallActive(true);
    setCurrentStepIndex(0);
    const resetSteps = steps.map(step => ({ ...step, completed: false }));
    onStepsUpdate(resetSteps);
    setAuthenticationFailed(false);
  };

  const endCall = () => {
    setCallActive(false);
    setCurrentStepIndex(0);
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
            <span className="text-sm font-medium">{completedSteps}/{totalSteps} Schritte abgeschlossen</span>
          </div>
          <Progress value={(completedSteps / totalSteps) * 100} className="h-2" />
        </div>
      )}

      {callActive && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Step */}
          <div className="lg:col-span-2">
            <Card className="shadow-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Aktueller Schritt: {steps[currentStepIndex]?.title}
                  </CardTitle>
                  <Badge variant={steps[currentStepIndex]?.required ? "destructive" : "secondary"}>
                    {steps[currentStepIndex]?.required ? "Pflicht" : "Optional"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Was zu tun ist:
                  </h3>
                  <p className="text-muted-foreground">{steps[currentStepIndex]?.description}</p>
                </div>
                
                <div className="bg-gradient-card p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Kommunikationsvorlage:
                  </h3>
                  <p className="italic text-foreground">{steps[currentStepIndex]?.communication}</p>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={() => handleStepComplete(steps[currentStepIndex]?.id)}
                    className="bg-gradient-primary"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Schritt abgeschlossen
                  </Button>
                  
                  {(steps[currentStepIndex]?.id === "identification" || steps[currentStepIndex]?.id === "verification") && (
                    <Button 
                      variant="destructive"
                      onClick={handleAuthenticationFailure}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Authentifizierung fehlgeschlagen
                    </Button>
                  )}
                </div>
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

            {/* Steps Checklist */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Schritte-Checkliste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                        index === currentStepIndex ? 'bg-primary/10 border border-primary/20' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-success text-success-foreground' 
                          : index === currentStepIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          step.completed ? 'text-success' : 'text-foreground'
                        }`}>
                          {step.title}
                        </p>
                        {step.required && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Pflicht
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
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
              Klicken Sie auf "Gespräch starten" um den Klick-Leitfaden zu aktivieren
            </p>
            <Button onClick={startCall} size="lg" className="bg-gradient-primary">
              <Phone className="w-5 h-5 mr-2" />
              Gespräch starten
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}