import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, FolderPlus, Trash, GripVertical, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkflowStepEditor } from "./WorkflowStepEditor";
import { CallStep } from "@/hooks/useCallSteps";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditorModeProps {
  steps: CallStep[];
  onStepsUpdate: (steps: CallStep[]) => void;
  loading: boolean;
  onSaveStep: (step: CallStep, isNew?: boolean) => void;
  onDeleteStep: (stepId: string) => void;
  currentWorkflow: string;
  workflows: string[];
  onWorkflowChange: (workflow: string) => void;
  onCreateWorkflow: (name: string) => void;
  onDeleteWorkflow: (name: string) => void;
  onReorderSteps?: (steps: CallStep[]) => void;
  onSaveAndExecute?: () => void;
  buttonTemplates: any[];
  onSaveButtonTemplate: (template: any) => Promise<any>;
  onDeleteButtonTemplate: (templateId: string) => Promise<void>;
}

interface SortableStepCardProps {
  step: CallStep;
  index: number;
  onEdit: (step: CallStep) => void;
  onDelete: (stepId: string) => void;
}

function SortableStepCard({ step, index, onEdit, onDelete }: SortableStepCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`shadow-card ${isDragging ? 'z-50' : ''}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {index + 1}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                {step.required && (
                  <Badge variant="destructive" className="text-xs">
                    Pflicht
                  </Badge>
                )}
                {step.stepType !== 'normal' && (
                  <Badge variant="outline" className="text-xs">
                    {step.stepType}
                  </Badge>
                )}
                {step.category && (
                  <Badge variant="secondary" className="text-xs">
                    {step.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(step)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(step.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-3">
          {step.description}
        </p>
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm italic">"{step.communication}"</p>
        </div>
        
        {step.subSteps && step.subSteps.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Unterschritte:</h4>
            <div className="space-y-2">
              {step.subSteps.map((subStep, subIndex) => (
                <div 
                  key={subStep.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded border-l-2 border-primary/30"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {index + 1}.{subIndex + 1}
                    </span>
                    <span className="text-sm">{subStep.title}</span>
                    {subStep.category && (
                      <Badge variant="outline" className="text-xs">
                        {subStep.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(subStep)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(subStep.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EditorMode({ 
  steps, 
  onStepsUpdate, 
  loading, 
  onSaveStep, 
  onDeleteStep, 
  currentWorkflow, 
  workflows, 
  onWorkflowChange, 
  onCreateWorkflow, 
  onDeleteWorkflow, 
  onReorderSteps,
  onSaveAndExecute,
  buttonTemplates,
  onSaveButtonTemplate,
  onDeleteButtonTemplate
}: EditorModeProps) {
  const [editingStep, setEditingStep] = useState<CallStep | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const mainSteps = steps.filter(step => step.stepType !== 'sub_step');

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setEditingStep({
      id: `step-${Date.now()}`,
      title: "",
      description: "",
      communication: "",
      stepType: "normal",
      required: false,
      nextStepConditions: [],
      positionX: 0,
      positionY: 0,
      completed: false,
      isStartStep: false,
      isEndStep: false,
      subSteps: [],
      workflowName: currentWorkflow,
    });
  };

  const handleEdit = (step: CallStep) => {
    setIsCreatingNew(false);
    setEditingStep(step);
  };

  const handleSave = (step: CallStep) => {
    onSaveStep(step, isCreatingNew);
    setEditingStep(null);
    setIsCreatingNew(false);
  };

  const handleCancel = () => {
    setEditingStep(null);
    setIsCreatingNew(false);
  };

  const handleCreateWorkflow = () => {
    if (newWorkflowName.trim()) {
      onCreateWorkflow(newWorkflowName.trim());
      setNewWorkflowName("");
      setShowNewWorkflowDialog(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = mainSteps.findIndex(step => step.id === active.id);
      const newIndex = mainSteps.findIndex(step => step.id === over.id);
      
      const reorderedSteps = arrayMove(mainSteps, oldIndex, newIndex);
      
      // Update all steps with new sort order
      const updatedSteps = reorderedSteps.map((step, index) => ({
        ...step,
        sortOrder: index + 1
      }));

      // Update steps in database
      if (onReorderSteps) {
        onReorderSteps(updatedSteps);
      } else {
        // Fallback: save each step individually with new sort order
        updatedSteps.forEach(step => {
          onSaveStep(step, false);
        });
      }
    }
  };

  if (editingStep) {
    return (
        <WorkflowStepEditor
          step={editingStep}
          allSteps={steps}
          onSave={handleSave}
          onCancel={handleCancel}
            buttonTemplates={buttonTemplates}
            onSaveButtonTemplate={onSaveButtonTemplate}
            onDeleteButtonTemplate={onDeleteButtonTemplate}
        />
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Management */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Liste:</span>
            <Select value={currentWorkflow} onValueChange={onWorkflowChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((workflow) => (
                  <SelectItem key={workflow} value={workflow}>
                    {workflow}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={showNewWorkflowDialog} onOpenChange={setShowNewWorkflowDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="w-4 h-4 mr-2" />
                Neue Liste
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Liste erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Name der neuen Liste..."
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkflow()}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewWorkflowDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleCreateWorkflow}>
                    Erstellen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {currentWorkflow !== 'Gesprächsschritte' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDeleteWorkflow(currentWorkflow)}
              className="text-destructive hover:text-destructive"
            >
              <Trash className="w-4 h-4 mr-2" />
              Liste löschen
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateNew} className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Neuer Schritt
          </Button>
          {onSaveAndExecute && (
            <Button onClick={onSaveAndExecute} variant="default" size="lg" className="bg-gradient-primary shadow-elevated">
              <CheckCircle className="w-4 h-4 mr-2" />
              Änderungen speichern & Schritte ausführen
            </Button>
          )}
        </div>
      </div>

      {/* Drag & Drop List View */}
      <div className="space-y-2">
        {mainSteps.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Noch keine Schritte in "{currentWorkflow}" vorhanden
              </p>
              <Button onClick={handleCreateNew} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ersten Schritt erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={mainSteps.map(step => step.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {mainSteps.map((step, index) => (
                  <SortableStepCard
                    key={step.id}
                    step={step}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={onDeleteStep}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}