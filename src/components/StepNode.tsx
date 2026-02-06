import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CallStep } from "@/hooks/useCallSteps";
import { Edit, Trash2, Play, GitBranch, Layers, Flag } from "lucide-react";

interface StepNodeProps {
  step: CallStep;
  onClick: () => void;
  onMove: (stepId: string, newX: number, newY: number) => void;
  onDelete: () => void;
}

export function StepNode({ step, onClick, onMove, onDelete }: StepNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    setIsDragging(true);
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const canvas = nodeRef.current?.parentElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, canvas.clientWidth - 300));
    const constrainedY = Math.max(0, Math.min(newY, canvas.clientHeight - 100));
    
    onMove(step.id, constrainedX, constrainedY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners when dragging
  if (isDragging) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  } else {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  const getStepIcon = () => {
    switch (step.stepType) {
      case 'decision':
        return <Layers className="w-4 h-4" />;
      case 'condition':
        return <GitBranch className="w-4 h-4" />;
      case 'sub_step':
        return <Flag className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getStepColor = () => {
    switch (step.stepType) {
      case 'decision':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950';
      case 'condition':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'sub_step':
        return 'border-green-500 bg-green-50 dark:bg-green-950';
      default:
        return 'border-border bg-background';
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute select-none cursor-move transition-shadow ${
        isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
      }`}
      style={{
        left: step.positionX,
        top: step.positionY,
        zIndex: isDragging ? 1000 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className={`w-72 p-4 ${getStepColor()}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStepIcon()}
            <h3 className="font-semibold text-sm truncate">{step.title}</h3>
          </div>
          <div className="flex gap-1">
            {step.isStartStep && (
              <Badge variant="outline" className="text-xs">Start</Badge>
            )}
            {step.isEndStep && (
              <Badge variant="outline" className="text-xs">Ende</Badge>
            )}
            {step.required && (
              <Badge variant="destructive" className="text-xs">Pflicht</Badge>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mb-3 line-clamp-2 prose prose-xs max-w-none" dangerouslySetInnerHTML={{ __html: step.description }} />

        {step.nextStepConditions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Verzweigungen:</p>
            {step.nextStepConditions.map((condition, index) => (
              <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                {condition.label}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="h-7 px-2"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
}