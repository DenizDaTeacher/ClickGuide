import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CallStep {
  id: string;
  title: string;
  description: string;
  communication: string;
  completed: boolean;
  required: boolean;
  parentStepId?: string;
  stepType: 'normal' | 'condition' | 'sub_step' | 'decision';
  conditionLabel?: string;
  nextStepConditions: Array<{
    condition: string;
    nextStepId: string;
    label: string;
  }>;
  positionX: number;
  positionY: number;
  isStartStep: boolean;
  isEndStep: boolean;
  category?: string;
  subSteps?: CallStep[];
  sortOrder?: number;
  workflowName?: string;
}

export type NextStepCondition = CallStep['nextStepConditions'][0];

export function useCallSteps() {
  const [steps, setSteps] = useState<CallStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkflow, setCurrentWorkflow] = useState<string>('Gesprächsschritte');
  const [workflows, setWorkflows] = useState<string[]>([]);
  const { toast } = useToast();

  // Load available workflows
  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('call_steps')
        .select('workflow_name')
        .not('workflow_name', 'is', null);
      
      if (error) throw error;
      
      const uniqueWorkflows = [...new Set(data?.map(step => step.workflow_name))];
      setWorkflows(uniqueWorkflows);
      
      if (uniqueWorkflows.length > 0 && !uniqueWorkflows.includes(currentWorkflow)) {
        setCurrentWorkflow(uniqueWorkflows[0]);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Fehler",
        description: "Workflows konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  // Load steps from Supabase for a specific workflow
  const loadSteps = async (workflowName?: string) => {
    const targetWorkflow = workflowName || currentWorkflow;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('call_steps')
        .select('*')
        .eq('workflow_name', targetWorkflow)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading steps:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Die Schritte konnten nicht geladen werden.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const formattedSteps: CallStep[] = data.map(step => ({
          id: step.step_id,
          title: step.title,
          description: step.description,
          communication: step.communication,
          completed: false, // Always start as false for agent mode
          required: step.required,
          parentStepId: step.parent_step_id || undefined,
          stepType: (step.step_type as CallStep['stepType']) || 'normal',
          conditionLabel: step.condition_label || undefined,
          nextStepConditions: (step.next_step_conditions as CallStep['nextStepConditions']) || [],
          positionX: step.position_x || 0,
          positionY: step.position_y || 0,
          isStartStep: step.is_start_step || false,
          isEndStep: step.is_end_step || false,
          category: step.category || undefined,
          sortOrder: step.sort_order || 0,
          workflowName: step.workflow_name,
          subSteps: [] // Will be populated separately if needed
        }));
        
        // Organize sub-steps under their parent steps
        const mainSteps = formattedSteps.filter(step => !step.parentStepId);
        const subSteps = formattedSteps.filter(step => step.parentStepId);
        
        mainSteps.forEach(mainStep => {
          mainStep.subSteps = subSteps.filter(sub => sub.parentStepId === mainStep.id);
        });
        
        setSteps(mainSteps);
      }
    } catch (error) {
      console.error('Error loading steps:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new workflow
  const createWorkflow = async (name: string) => {
    if (workflows.includes(name)) {
      toast({
        title: "Fehler",
        description: "Eine Liste mit diesem Namen existiert bereits",
        variant: "destructive",
      });
      return;
    }
    
    setWorkflows(prev => [...prev, name]);
    setCurrentWorkflow(name);
    setSteps([]);
    
    toast({
      title: "Erfolg",
      description: `Liste "${name}" wurde erstellt`,
    });
  };

  // Delete a workflow
  const deleteWorkflow = async (name: string) => {
    if (name === 'Gesprächsschritte') {
      toast({
        title: "Fehler",
        description: "Die Standard-Liste kann nicht gelöscht werden",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('call_steps')
        .delete()
        .eq('workflow_name', name);
      
      if (error) throw error;
      
      setWorkflows(prev => prev.filter(w => w !== name));
      if (currentWorkflow === name) {
        setCurrentWorkflow('Gesprächsschritte');
        await loadSteps('Gesprächsschritte');
      }
      
      toast({
        title: "Erfolg",
        description: `Liste "${name}" wurde gelöscht`,
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Fehler",
        description: "Liste konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  // Save a step to Supabase
  const saveStep = async (step: CallStep, isNew: boolean = false) => {
    try {
      const stepData = {
        title: step.title,
        description: step.description,
        communication: step.communication,
        required: step.required,
        parent_step_id: step.parentStepId,
        step_type: step.stepType,
        condition_label: step.conditionLabel,
        next_step_conditions: step.nextStepConditions,
        position_x: step.positionX,
        position_y: step.positionY,
        is_start_step: step.isStartStep,
        is_end_step: step.isEndStep,
        category: step.category,
        workflow_name: currentWorkflow,
      };

      if (isNew) {
        // Insert new step
        const maxSortOrder = Math.max(...steps.map((_, index) => index + 1), 0);
        const { error } = await supabase
          .from('call_steps')
          .insert({
            step_id: step.id,
            sort_order: maxSortOrder + 1,
            ...stepData
          });

        if (error) {
          console.error('Error inserting step:', error);
          toast({
            title: "Fehler beim Speichern",
            description: "Der neue Schritt konnte nicht gespeichert werden.",
            variant: "destructive",
          });
          return false;
        }
      } else {
        // Update existing step
        const { error } = await supabase
          .from('call_steps')
          .update(stepData)
          .eq('step_id', step.id);

        if (error) {
          console.error('Error updating step:', error);
          toast({
            title: "Fehler beim Speichern",
            description: "Der Schritt konnte nicht aktualisiert werden.",
            variant: "destructive",
          });
          return false;
        }
      }
      
      // Save sub-steps if they exist
      if (step.subSteps && step.subSteps.length > 0) {
        for (const subStep of step.subSteps) {
          const subStepData = {
            title: subStep.title,
            description: subStep.description,
            communication: subStep.communication,
            required: subStep.required,
            parent_step_id: step.id,
            step_type: 'sub_step',
            condition_label: subStep.conditionLabel,
            next_step_conditions: subStep.nextStepConditions,
            position_x: subStep.positionX || 0,
            position_y: subStep.positionY || 0,
            is_start_step: false,
            is_end_step: false,
            category: subStep.category,
            workflow_name: currentWorkflow,
          };
          
          const { data: existingSubStep } = await supabase
            .from('call_steps')
            .select('id')
            .eq('step_id', subStep.id)
            .maybeSingle();
            
          if (existingSubStep) {
            // Update existing sub-step
            await supabase
              .from('call_steps')
              .update(subStepData)
              .eq('step_id', subStep.id);
          } else {
            // Insert new sub-step
            await supabase
              .from('call_steps')
              .insert({
                step_id: subStep.id,
                sort_order: subStep.sortOrder || 0,
                ...subStepData
              });
          }
        }
      }

      toast({
        title: "Erfolgreich gespeichert",
        description: "Der Schritt wurde erfolgreich gespeichert.",
      });
      
      // Reload steps to get fresh data
      await loadSteps();
      return true;
    } catch (error) {
      console.error('Error saving step:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a step from Supabase
  const deleteStep = async (stepId: string) => {
    try {
      const { error } = await supabase
        .from('call_steps')
        .delete()
        .eq('step_id', stepId);

      if (error) {
        console.error('Error deleting step:', error);
        toast({
          title: "Fehler beim Löschen",
          description: "Der Schritt konnte nicht gelöscht werden.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Erfolgreich gelöscht",
        description: "Der Schritt wurde erfolgreich gelöscht.",
      });

      // Reload steps to get fresh data
      await loadSteps();
      return true;
    } catch (error) {
      console.error('Error deleting step:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update steps locally (for agent mode)
  const updateStepsLocally = (newSteps: CallStep[]) => {
    setSteps(newSteps);
  };

  // Load workflows on mount
  useEffect(() => {
    loadWorkflows();
  }, []);

  // Load steps when workflow changes
  useEffect(() => {
    if (currentWorkflow) {
      loadSteps();
    }
  }, [currentWorkflow]);

  return {
    steps,
    loading,
    currentWorkflow,
    workflows,
    setCurrentWorkflow,
    createWorkflow,
    deleteWorkflow,
    saveStep,
    deleteStep,
    updateStepsLocally,
    reloadSteps: loadSteps
  };
}