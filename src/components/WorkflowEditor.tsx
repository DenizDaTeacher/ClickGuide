import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CallStep } from "@/hooks/useCallSteps";
import { Plus, Save, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StepNode } from "./StepNode";
import { WorkflowStepEditor } from "./WorkflowStepEditor";

interface WorkflowEditorProps {
  steps: CallStep[];
  onSaveStep: (step: CallStep, isNew: boolean) => Promise<boolean>;
  onDeleteStep: (stepId: string) => Promise<boolean>;
  buttonTemplates: any[];
  onSaveButtonTemplate: (template: any) => Promise<any>;
  onDeleteButtonTemplate: (templateId: string) => Promise<void>;
}

export function WorkflowEditor({ 
  steps, 
  onSaveStep, 
  onDeleteStep,
  buttonTemplates,
  onSaveButtonTemplate,
  onDeleteButtonTemplate
}: WorkflowEditorProps) {
  const [selectedStep, setSelectedStep] = useState<CallStep | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [newStep, setNewStep] = useState<Partial<CallStep>>({
    title: "",
    description: "",
    communication: "",
    required: false,
    stepType: "normal",
    nextStepConditions: [],
    positionX: 100,
    positionY: 100,
    isStartStep: false,
    isEndStep: false
  });

  const handleAddStep = () => {
    // Position new step at center of canvas or next to last step
    const lastStep = steps[steps.length - 1];
    const newX = lastStep ? lastStep.positionX + 200 : 100;
    const newY = lastStep ? lastStep.positionY : 100;
    
    setNewStep({
      ...newStep,
      positionX: newX,
      positionY: newY,
      id: `step-${Date.now()}`
    });
    setSelectedStep(newStep as CallStep);
    setShowStepEditor(true);
  };

  const handleStepClick = (step: CallStep) => {
    setSelectedStep(step);
    setShowStepEditor(true);
  };

  const handleStepMove = useCallback((stepId: string, newX: number, newY: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      const updatedStep = { ...step, positionX: newX, positionY: newY };
      onSaveStep(updatedStep, false);
    }
  }, [steps, onSaveStep]);

  const handleSaveStep = async (step: CallStep) => {
    const isNew = !steps.find(s => s.id === step.id);
    const success = await onSaveStep(step, isNew);
    if (success) {
      setShowStepEditor(false);
      setSelectedStep(null);
      setNewStep({
        title: "",
        description: "",
        communication: "",
        required: false,
        stepType: "normal",
        nextStepConditions: [],
        positionX: 100,
        positionY: 100,
        isStartStep: false,
        isEndStep: false
      });
    }
  };

  const renderConnectionLines = () => {
    return steps.map(step => 
      step.nextStepConditions.map((condition, index) => {
        const targetStep = steps.find(s => s.id === condition.nextStepId);
        if (!targetStep) return null;

        const startX = step.positionX + 150; // Half width of step node
        const startY = step.positionY + 50; // Half height of step node
        const endX = targetStep.positionX;
        const endY = targetStep.positionY + 50;

        return (
          <svg
            key={`${step.id}-${condition.nextStepId}-${index}`}
            className="absolute pointer-events-none"
            style={{
              left: Math.min(startX, endX),
              top: Math.min(startY, endY),
              width: Math.abs(endX - startX) + 10,
              height: Math.abs(endY - startY) + 10,
            }}
          >
            <line
              x1={startX > endX ? Math.abs(endX - startX) : 0}
              y1={startY > endY ? Math.abs(endY - startY) : 0}
              x2={endX > startX ? Math.abs(endX - startX) : 0}
              y2={endY > startY ? Math.abs(endY - startY) : 0}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="hsl(var(--primary))"
                />
              </marker>
            </defs>
          </svg>
        );
      })
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Workflow Editor</h2>
          <p className="text-sm text-muted-foreground">
            Erstellen Sie Schritte und verbinden Sie diese mit Linien für verzweigte Workflows
          </p>
        </div>
        <Button onClick={handleAddStep} className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Schritt hinzufügen
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-auto bg-muted/30" ref={canvasRef}>
        <div className="relative w-full h-full min-w-[2000px] min-h-[1000px]">
          {/* Connection lines */}
          {renderConnectionLines()}

          {/* Step nodes */}
          {steps.map((step) => (
            <StepNode
              key={step.id}
              step={step}
              onClick={() => handleStepClick(step)}
              onMove={handleStepMove}
              onDelete={() => onDeleteStep(step.id)}
            />
          ))}
        </div>
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
              buttonTemplates={buttonTemplates}
              onSaveButtonTemplate={onSaveButtonTemplate}
              onDeleteButtonTemplate={onDeleteButtonTemplate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}