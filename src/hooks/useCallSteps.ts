import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenant';
import type { Json } from '@/integrations/supabase/types';

export interface ActionButton {
  id: string;
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  actionType: 'complete' | 'fail' | 'info' | 'custom';
  statusMessage?: string;
  icon?: string;
  enabled?: boolean;
  templateName?: string;
  statusIcon?: string;
  statusBackgroundColor?: string;
}

export interface ButtonTemplate {
  id: string;
  name: string;
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  icon?: string;
  actionType: 'complete' | 'fail' | 'info' | 'custom';
  statusMessage?: string;
  backgroundColor?: string;
  statusIcon?: string;
  statusBackgroundColor?: string;
}

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
  actionButtons?: ActionButton[];
  statusBackgroundColor?: string;
  statusIcon?: string;
}

export type NextStepCondition = CallStep['nextStepConditions'][0];

export function useCallSteps() {
  const [steps, setSteps] = useState<CallStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkflow, setCurrentWorkflow] = useState<string>('Gesprächsschritte');
  const [workflows, setWorkflows] = useState<string[]>([]);
  const [buttonTemplates, setButtonTemplates] = useState<ButtonTemplate[]>([]);
  const { toast } = useToast();
  const { tenantId } = useTenant();

  console.log('🏢 useCallSteps initialized with tenant:', tenantId);

  // Load available workflows
  const loadWorkflows = async () => {
    try {
      console.log('📁 Loading workflows for tenant:', tenantId);
      const { data, error } = await supabase
        .from('call_steps')
        .select('workflow_name')
        .eq('tenant_id', tenantId)
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
      console.log('📊 Loading steps for workflow:', targetWorkflow, 'tenant:', tenantId);
      
      const { data, error } = await supabase
        .from('call_steps')
        .select('*')
        .eq('workflow_name', targetWorkflow)
        .eq('tenant_id', tenantId)
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
          actionButtons: ((step as any).action_buttons as ActionButton[]) || [],
          subSteps: [], // Will be populated separately if needed
          statusBackgroundColor: step.status_background_color || undefined,
          statusIcon: step.status_icon || undefined
        }));
        
        // Organize sub-steps under their parent steps
        const mainSteps = formattedSteps.filter(step => !step.parentStepId);
        const subSteps = formattedSteps.filter(step => step.parentStepId);
        
        console.log('📊 Loading steps for workflow:', targetWorkflow);
        console.log('📊 Total formatted steps:', formattedSteps.length);
        console.log('📊 Main steps:', mainSteps.length);
        console.log('📊 Sub steps:', subSteps.length);
        console.log('📊 Main steps data:', mainSteps.map(s => ({id: s.id, title: s.title, sortOrder: s.sortOrder})));
        
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
    console.log('📁 Creating new workflow:', name);
    
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
    
    console.log('📁 Workflow created, ensuring default template...');
    
    // Ensure default "Schritt abgeschlossen" template exists
    await ensureDefaultTemplate();
    
    console.log('📁 Workflow creation complete');
    
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
        .eq('workflow_name', name)
        .eq('tenant_id', tenantId);
      
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

  // Ensure default "Schritt abgeschlossen" template exists
  const ensureDefaultTemplate = async () => {
    console.log('🔧 Ensuring default template exists...');
    const existingDefault = buttonTemplates.find(t => t.name === 'Schritt abgeschlossen');
    console.log('🔧 Existing default template:', existingDefault);
    
    if (!existingDefault) {
      console.log('🔧 Creating default template...');
      try {
        const newTemplate = await saveButtonTemplate({
          name: 'Schritt abgeschlossen',
          label: 'Schritt abgeschlossen',
          variant: 'default',
          actionType: 'complete',
          statusMessage: 'Schritt wurde erfolgreich abgeschlossen',
          statusIcon: '✅',
          statusBackgroundColor: 'bg-green-500'
        });
        console.log('🔧 Default template created successfully:', newTemplate);
        return newTemplate;
      } catch (error) {
        console.error('🔧 Error creating default template:', error);
      }
    }
    return existingDefault;
  };

  // Save a step to Supabase
  const saveStep = async (step: CallStep, isNew: boolean = false) => {
    try {
      console.log('💾 Saving step...', { stepTitle: step.title, isNew, currentWorkflow });
      
      // Ensure step has default button if no buttons exist
      let processedStep = { ...step };
      if (!processedStep.actionButtons || processedStep.actionButtons.length === 0) {
        console.log('💾 No action buttons found, ensuring default template...');
        
        // Make sure we have the latest templates loaded
        await loadButtonTemplates();
        const defaultTemplate = await ensureDefaultTemplate();
        
        if (defaultTemplate) {
          console.log('💾 Adding default template to step:', defaultTemplate);
          processedStep.actionButtons = [{
            id: crypto.randomUUID(),
            label: defaultTemplate.label,
            variant: defaultTemplate.variant,
            actionType: defaultTemplate.actionType,
            statusMessage: defaultTemplate.statusMessage,
            statusIcon: defaultTemplate.statusIcon,
            statusBackgroundColor: defaultTemplate.statusBackgroundColor,
            enabled: true,
            templateName: defaultTemplate.name
          }];
        } else {
          // Fallback: create button manually
          console.log('💾 Creating fallback default button...');
          processedStep.actionButtons = [{
            id: crypto.randomUUID(),
            label: 'Schritt abgeschlossen',
            variant: 'default',
            actionType: 'complete',
            statusMessage: 'Schritt wurde erfolgreich abgeschlossen',
            statusIcon: '✅',
            statusBackgroundColor: 'bg-green-500',
            enabled: true,
            templateName: 'Schritt abgeschlossen'
          }];
        }
      }

      console.log('💾 Final processed step:', { 
        actionButtons: processedStep.actionButtons?.length,
        workflow: currentWorkflow 
      });

      const stepData = {
        title: processedStep.title,
        description: processedStep.description,
        communication: processedStep.communication,
        required: processedStep.required,
        parent_step_id: processedStep.parentStepId,
        step_type: processedStep.stepType,
        condition_label: processedStep.conditionLabel,
        next_step_conditions: processedStep.nextStepConditions,
        action_buttons: JSON.parse(JSON.stringify(processedStep.actionButtons)) as Json || [],
        position_x: processedStep.positionX,
        position_y: processedStep.positionY,
        is_start_step: processedStep.isStartStep,
        is_end_step: processedStep.isEndStep,
        category: processedStep.category,
        workflow_name: currentWorkflow,
        tenant_id: tenantId,
        status_background_color: processedStep.statusBackgroundColor,
        status_icon: processedStep.statusIcon
      };

      console.log('💾 Saving step data to database:', stepData);

      if (isNew) {
        // Insert new step
        const maxSortOrder = Math.max(...steps.map((_, index) => index + 1), 0);
        console.log('💾 Inserting new step with sort order:', maxSortOrder + 1);
        
        const { data, error } = await supabase
          .from('call_steps')
          .insert({
            step_id: processedStep.id,
            sort_order: maxSortOrder + 1,
            ...stepData
          })
          .select();

        if (error) {
          console.error('💾 Error inserting step:', error);
          toast({
            title: "Fehler beim Speichern",
            description: `Der neue Schritt konnte nicht gespeichert werden: ${error.message}`,
            variant: "destructive",
          });
          return false;
        }
        
        console.log('💾 Step inserted successfully:', data);
      } else {
        // Update existing step
        console.log('💾 Updating existing step:', processedStep.id);
        const { data, error } = await supabase
          .from('call_steps')
          .update(stepData)
          .eq('step_id', processedStep.id)
          .select();

        if (error) {
          console.error('💾 Error updating step:', error);
          toast({
            title: "Fehler beim Speichern",
            description: `Der Schritt konnte nicht aktualisiert werden: ${error.message}`,
            variant: "destructive",
          });
          return false;
        }
        
        console.log('💾 Step updated successfully:', data);
      }
      
      // Save sub-steps if they exist
      if (processedStep.subSteps && processedStep.subSteps.length > 0) {
        for (const subStep of processedStep.subSteps) {
          const subStepData = {
            title: subStep.title,
            description: subStep.description,
            communication: subStep.communication,
            required: subStep.required,
            parent_step_id: processedStep.id,
            step_type: 'sub_step',
            condition_label: subStep.conditionLabel,
            next_step_conditions: subStep.nextStepConditions,
            position_x: subStep.positionX || 0,
            position_y: subStep.positionY || 0,
            is_start_step: false,
            is_end_step: false,
            category: subStep.category,
            workflow_name: currentWorkflow,
            tenant_id: tenantId,
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

      console.log('💾 Step saved successfully, reloading steps...');
      
      toast({
        title: "Erfolgreich gespeichert",
        description: "Der Schritt wurde erfolgreich gespeichert.",
      });
      
      // Reload steps to get fresh data
      await loadSteps();
      console.log('💾 Steps reloaded after save');
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
        .eq('step_id', stepId)
        .eq('tenant_id', tenantId);

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

  // Reorder steps in database
  const reorderSteps = async (reorderedSteps: CallStep[]) => {
    try {
      // Update all steps with new sort order in parallel
      const updatePromises = reorderedSteps.map((step, index) => 
        supabase
          .from('call_steps')
          .update({ sort_order: index + 1 })
          .eq('step_id', step.id)
          .eq('tenant_id', tenantId)
      );

      const results = await Promise.all(updatePromises);
      
      // Check if any updates failed
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Failed to update step order');
      }

      toast({
        title: "Reihenfolge aktualisiert",
        description: "Die Schritte wurden erfolgreich neu sortiert.",
      });

      // Update local state
      setSteps(reorderedSteps);
      
      return true;
    } catch (error) {
      console.error('Error reordering steps:', error);
      toast({
        title: "Fehler beim Sortieren",
        description: "Die Reihenfolge konnte nicht gespeichert werden.",
        variant: "destructive",
      });
      
      // Reload steps to restore original order
      await loadSteps();
      return false;
    }
  };

  // Update steps locally (for agent mode)
  const updateStepsLocally = (newSteps: CallStep[]) => {
    setSteps(newSteps);
  };

  // Load button templates
  const loadButtonTemplates = async () => {
    try {
      console.log('🔘 Loading button templates for tenant:', tenantId);
      const { data, error } = await supabase
        .from('button_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name');
      
      if (error) throw error;
      
      const templates: ButtonTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        label: template.label,
        variant: (template.variant || 'default') as ButtonTemplate['variant'],
        icon: template.icon || undefined,
        actionType: (template.action_type || 'custom') as ButtonTemplate['actionType'], 
        statusMessage: template.status_message || undefined,
        backgroundColor: template.background_color || undefined,
        statusIcon: (template as any).status_icon || undefined,
        statusBackgroundColor: (template as any).status_background_color || undefined
      }));
      
      setButtonTemplates(templates);
    } catch (error) {
      console.error('Error loading button templates:', error);
    }
  };

  // Save button template
  const saveButtonTemplate = async (template: Omit<ButtonTemplate, 'id'>) => {
    try {
      console.log('🔘 Saving button template for tenant:', tenantId, template);
      const { data, error } = await supabase
        .from('button_templates')
        .insert([{
          name: template.name,
          label: template.label,
          variant: template.variant,
          icon: template.icon,
          action_type: template.actionType,
          status_message: template.statusMessage,
          background_color: template.backgroundColor,
          status_icon: template.statusIcon,
          status_background_color: template.statusBackgroundColor,
          tenant_id: tenantId
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newTemplate: ButtonTemplate = {
        id: data.id,
        name: data.name,
        label: data.label,
        variant: (data.variant || 'default') as ButtonTemplate['variant'],
        icon: data.icon || undefined,
        actionType: (data.action_type || 'custom') as ButtonTemplate['actionType'],
        statusMessage: data.status_message || undefined,
        backgroundColor: data.background_color || undefined,
        statusIcon: (data as any).status_icon || undefined,
        statusBackgroundColor: (data as any).status_background_color || undefined
      };
      
      setButtonTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (error) {
      console.error('Error saving button template:', error);
      throw error;
    }
  };

  // Delete button template
  const deleteButtonTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('button_templates')
        .delete()
        .eq('id', templateId)
        .eq('tenant_id', tenantId);
      
      if (error) throw error;
      setButtonTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting button template:', error);
      throw error;
    }
  };

  // Load workflows and templates when tenant changes
  useEffect(() => {
    if (tenantId) {
      console.log('🏢 Tenant changed, reloading data for:', tenantId);
      loadWorkflows();
      loadButtonTemplates();
    }
  }, [tenantId]);

  // Ensure default template exists after loading templates
  useEffect(() => {
    if (buttonTemplates.length > 0) {
      ensureDefaultTemplate();
    }
  }, [buttonTemplates]);

  // Load steps when workflow or tenant changes
  useEffect(() => {
    if (currentWorkflow && tenantId) {
      console.log('📊 Workflow or tenant changed, loading steps:', currentWorkflow, tenantId);
      loadSteps();
    }
  }, [currentWorkflow, tenantId]);

  return {
    steps,
    loading,
    currentWorkflow,
    workflows,
    buttonTemplates,
    setCurrentWorkflow,
    createWorkflow,
    deleteWorkflow,
    saveStep,
    deleteStep,
    updateStepsLocally,
    reorderSteps,
    reloadSteps: loadSteps,
    saveButtonTemplate,
    deleteButtonTemplate,
    loadButtonTemplates
  };
}