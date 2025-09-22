import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Phone, User, Shield, FileText, Clock, GitBranch, Info, X } from "lucide-react";
import { CallStep, ActionButton } from "@/hooks/useCallSteps";

interface AgentModeProps {
  steps: CallStep[];
  onStepsUpdate: (steps: CallStep[]) => void;
  currentWorkflow: string;
}

export default function AgentMode({ steps, onStepsUpdate, currentWorkflow }: AgentModeProps) {
  const [callActive, setCallActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<CallStep | null>(null);
  const [stepHistory, setStepHistory] = useState<CallStep[]>([]);
  const [authenticationFailed, setAuthenticationFailed] = useState(false);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState<number | null>(null);

  const completedSteps = stepHistory.length;
  const totalSteps = steps.length;
  const requiredSteps = steps.filter(step => step.required);
  const completedRequiredSteps = stepHistory.filter(step => step.required).length;

  // Get current display step (main step or sub-step)
  const getCurrentDisplayStep = () => {
    if (!currentStep) return null;
    if (currentSubStepIndex !== null && currentStep.subSteps && currentStep.subSteps[currentSubStepIndex]) {
      return currentStep.subSteps[currentSubStepIndex];
    }
    return currentStep;
  };

  const currentDisplayStep = getCurrentDisplayStep();

  // Find start step or use first step
  const getStartStep = () => {
    console.log('🔍 Getting start step from steps:', steps);
    console.log('🔍 Steps count:', steps.length);
    const startStep = steps.find(step => step.isStartStep) || steps[0];
    console.log('🔍 Selected start step:', startStep);
    return startStep;
  };

  const handleStepComplete = (nextStepId?: string) => {
    if (!currentStep) {
      console.log('❌ No current step to complete');
      return;
    }
    
    console.log('✅ Completing step:', currentStep.title, 'ID:', currentStep.id);
    console.log('🔍 Status messages before completion:', statusMessages);
    
    // Handle sub-steps first
    if (currentStep.subSteps && currentStep.subSteps.length > 0) {
      if (currentSubStepIndex === null) {
        // Start with first sub-step
        console.log('🔄 Starting sub-steps for:', currentStep.title);
        setCurrentSubStepIndex(0);
        return;
      } else if (currentSubStepIndex < currentStep.subSteps.length - 1) {
        // Move to next sub-step
        console.log('➡️ Moving to next sub-step:', currentSubStepIndex + 1);
        setCurrentSubStepIndex(currentSubStepIndex + 1);
        return;
      } else {
        // All sub-steps completed, continue with main step completion
        console.log('✅ All sub-steps completed, completing main step');
        setCurrentSubStepIndex(null);
      }
    }
    
    const updatedSteps = steps.map(step => 
      step.id === currentStep.id ? { ...step, completed: true } : step
    );
    onStepsUpdate(updatedSteps);
    
    // Add current step to history
    setStepHistory(prev => [...prev, currentStep]);
    
    // Check if this is an end step
    if (currentStep.isEndStep) {
      console.log('🏁 Reached end step, stopping workflow');
      setCurrentStep(null);
      return;
    }
    
    // Move to next step
    if (nextStepId) {
      console.log('🎯 Moving to specific next step:', nextStepId);
      const nextStep = steps.find(step => step.id === nextStepId);
      console.log('🎯 Found next step:', nextStep);
      setCurrentStep(nextStep || null);
      // Clear status messages when moving to a new step
      if (nextStep) {
        console.log('🧹 Clearing status messages for new step');
        setStatusMessages([]);
        setAuthenticationFailed(false); // Also clear authentication failure state
      }
    } else {
      // Fix: Use step ID to find current step index instead of object reference
      const currentIndex = steps.findIndex(step => step.id === currentStep.id);
      console.log('📍 Current step index (by ID):', currentIndex, 'of', steps.length, 'steps');
      const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
      console.log('➡️ Next step in sequence:', nextStep);
      
      if (nextStep) {
        console.log('🔍 Next step action buttons:', nextStep.actionButtons);
      }
      
      setCurrentStep(nextStep);
      
      // Clear status messages when moving to a new step
      if (nextStep) {
        console.log('🧹 Clearing status messages for new step');
        setStatusMessages([]);
        setAuthenticationFailed(false); // Also clear authentication failure state
      }
    }
    
    console.log('🔍 Status messages after step change:', statusMessages);
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
      // Clear status messages and authentication failure when moving to a new step
      console.log('🧹 Clearing status messages for branch choice');
      setStatusMessages([]);
      setAuthenticationFailed(false);
    }
  };

  const handleActionButton = (button: ActionButton) => {
    console.log('🔴 Button clicked:', button);
    if (!currentStep) {
      console.log('❌ No current step');
      return;
    }
    
    console.log('🔴 Button actionType:', button.actionType);
    console.log('🔴 Button statusMessage:', button.statusMessage);
    
    // Only add status message if there is one defined AND it's not a complete action
    if (button.statusMessage && button.actionType !== 'complete') {
      console.log('📝 Adding status message from button:', button.statusMessage);
      setStatusMessages(prev => [...prev, button.statusMessage!]);
    }
    
    // Handle different action types
    switch (button.actionType) {
      case 'complete':
        console.log('✅ Completing step via button');
        handleStepComplete();
        break;
      case 'fail':
        console.log('❌ Setting authentication failed');
        setAuthenticationFailed(true);
        break;
      case 'info':
      case 'custom':
      default:
        console.log('ℹ️ Info/custom action - status message already added above');
        break;
    }
  };

  const handleAuthenticationFailure = () => {
    setAuthenticationFailed(true);
  };

  const startCall = () => {
    console.log('🚀 Starting call with steps:', steps);
    console.log('🚀 Current workflow:', currentWorkflow);
    setCallActive(true);
    const startStep = getStartStep();
    console.log('🚀 Setting current step to:', startStep);
    setCurrentStep(startStep);
    setStepHistory([]);
    setCurrentSubStepIndex(null);
    const resetSteps = steps.map(step => ({ ...step, completed: false }));
    onStepsUpdate(resetSteps);
    setAuthenticationFailed(false);
    setStatusMessages([]);
  };

  const endCall = () => {
    setCallActive(false);
    setCurrentStep(null);
    setStepHistory([]);
    const resetSteps = steps.map(step => ({ ...step, completed: false }));
    onStepsUpdate(resetSteps);
    setAuthenticationFailed(false);
    setStatusMessages([]);
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
            <span className="text-sm font-medium">{completedSteps} von {totalSteps} Schritten</span>
          </div>
          <Progress value={totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0} className="h-2" />
        </div>
      )}

      {callActive && currentDisplayStep && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Step */}
          <div className="lg:col-span-2">
            <Card className="shadow-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {currentSubStepIndex !== null ? (
                      <div className="space-y-1">
                        <div className="text-base text-muted-foreground">
                          {currentStep?.title} → Unterschritt {currentSubStepIndex + 1}
                        </div>
                        <div>{currentDisplayStep.title}</div>
                      </div>
                    ) : (
                      currentDisplayStep.title
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {currentDisplayStep.required && (
                      <Badge variant="destructive">Pflicht</Badge>
                    )}
                    {currentDisplayStep.stepType !== 'normal' && (
                      <Badge variant="outline">{currentDisplayStep.stepType}</Badge>
                    )}
                    {currentDisplayStep.category && (
                      <Badge variant="secondary">{currentDisplayStep.category}</Badge>
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
                  <p className="text-muted-foreground">{currentDisplayStep.description}</p>
                </div>
                
                <div className="bg-gradient-card p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Kommunikationsvorlage:
                  </h3>
                  <p className="italic text-foreground">{currentDisplayStep.communication}</p>
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
                  <div className="flex flex-wrap gap-3">
                    {/* Default completion button - always present */}
                    <Button 
                      onClick={() => handleStepComplete()}
                      className="bg-gradient-primary"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Schritt abgeschlossen
                    </Button>
                    
                    {/* Custom action buttons - show from current display step */}
                    {currentDisplayStep && currentDisplayStep.actionButtons && currentDisplayStep.actionButtons
                      .filter(button => button.enabled !== false)
                      .map((button) => {
                        return (
                          <Button
                            key={button.id}
                            variant={button.variant}
                            onClick={() => handleActionButton(button)}
                          >
                            {button.icon && <span className="mr-2">{button.icon}</span>}
                            {button.label}
                          </Button>
                        );
                      })}
                    
                    {/* Custom action buttons from main step (if we're in a sub-step) */}
                    {currentSubStepIndex !== null && currentStep && currentStep.actionButtons && currentStep.actionButtons
                      .filter(button => button.enabled !== false)
                      .filter(button => !currentDisplayStep?.actionButtons?.some(subButton => subButton.id === button.id))
                      .map((button) => {
                        return (
                          <Button
                            key={button.id}
                            variant={button.variant}
                            onClick={() => handleActionButton(button)}
                          >
                            {button.icon && <span className="mr-2">{button.icon}</span>}
                            {button.label}
                          </Button>
                        );
                      })}
                    
                    {/* Legacy decision button for backward compatibility */}
                    {currentStep.stepType === 'decision' && (!currentStep.actionButtons || currentStep.actionButtons.length === 0) && (
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          handleAuthenticationFailure();
                          setStatusMessages(prev => [...prev, "Problem bei der Authentifizierung aufgetreten"]);
                        }}
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
                
                {/* Custom status messages from action buttons */}
                {statusMessages.map((message, index) => {
                  // Find the button that created this status message to get styling
                  const buttons = currentStep?.actionButtons || [];
                  const messageButton = buttons.find(button => button.statusMessage === message);
                  
                  // Create transparent background based on the button's background color
                  let transparentBg = 'bg-primary/10 border-primary/20';
                  if (messageButton?.statusBackgroundColor && messageButton.statusBackgroundColor !== 'default') {
                    const colorClass = messageButton.statusBackgroundColor;
                    if (colorClass.includes('blue')) transparentBg = 'bg-blue-500/10 border-blue-500/20';
                    else if (colorClass.includes('green')) transparentBg = 'bg-green-500/10 border-green-500/20';
                    else if (colorClass.includes('yellow')) transparentBg = 'bg-yellow-500/10 border-yellow-500/20';
                    else if (colorClass.includes('red')) transparentBg = 'bg-red-500/10 border-red-500/20';
                    else if (colorClass.includes('purple')) transparentBg = 'bg-purple-500/10 border-purple-500/20';
                    else if (colorClass.includes('pink')) transparentBg = 'bg-pink-500/10 border-pink-500/20';
                    else if (colorClass.includes('gray')) transparentBg = 'bg-gray-500/10 border-gray-500/20';
                  }
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${transparentBg}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {messageButton?.statusIcon && (
                            <span className="text-base">{messageButton.statusIcon}</span>
                          )}
                          <p className="text-sm font-medium pr-2">
                            {message}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStatusMessages(prev => prev.filter((_, i) => i !== index))}
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
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
                  Schritte Checkliste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Keine Schritte konfiguriert</p>
                  ) : (
                    steps.map((step, index) => {
                      const isCompleted = stepHistory.some(completedStep => completedStep.id === step.id);
                      const isCurrent = currentStep && currentStep.id === step.id;
                      const isPending = !isCompleted && !isCurrent;
                      
                      return (
                        <div 
                          key={step.id}
                          className={`flex items-center space-x-3 p-2 rounded-lg border ${
                            isCompleted 
                              ? 'bg-success/5 border-success/20' 
                              : isCurrent 
                                ? 'bg-primary/10 border-primary/20' 
                                : 'bg-muted/30 border-muted/40'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted 
                              ? 'bg-success text-success-foreground' 
                              : isCurrent 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : isCurrent ? (
                              <span>▶</span>
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              isCompleted 
                                ? 'text-success' 
                                : isCurrent 
                                  ? 'text-primary' 
                                  : 'text-muted-foreground'
                            }`}>
                              {step.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {step.required && (
                                <Badge variant="outline" className="text-xs">
                                  Pflicht
                                </Badge>
                              )}
                              {isCompleted && (
                                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                                  Abgeschlossen
                                </Badge>
                              )}
                              {isCurrent && (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                  Aktuell
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
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
              Klicken Sie auf "Gespräch starten" um den Workflow "{currentWorkflow}" zu durchlaufen
            </p>
            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-6">
                Keine Schritte in "{currentWorkflow}" konfiguriert. Wechseln Sie zum Editor-Modus um Schritte zu erstellen.
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