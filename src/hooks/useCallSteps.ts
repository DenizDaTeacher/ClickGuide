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
  stepType: 'normal' | 'condition' | 'sub_step' | 'decision' | 'router';
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
  topicId?: string;
  isTopicStep?: boolean; // Marks if this step is a topic selection step
  parentTopicId?: string; // For sub-steps belonging to a topic
  isServicePlusStep?: boolean; // Marks if this step should show ServicePlus Coach
  imageUrl?: string; // URL of uploaded image for the step
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

  // Create default workflow for new projects
  const createDefaultWorkflow = async (projectId: string) => {
    console.log('🆕 Creating default workflow for project:', projectId);
    
    try {
      // Check if workflow already exists
      const { data: existingSteps } = await supabase
        .from('call_steps')
        .select('id')
        .eq('tenant_id', projectId)
        .eq('workflow_name', 'Gesprächsschritte')
        .limit(1);

      if (existingSteps && existingSteps.length > 0) {
        console.log('✅ Default workflow already exists');
        return;
      }

      // Load "Der perfekte Call" template
      console.log('📋 Loading "Der perfekte Call" template for new project');
      const { data: template, error: templateError } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('name', 'Der perfekte Call')
        .eq('is_default', true)
        .single();

      if (templateError || !template) {
        console.error('❌ Template not found, creating basic steps instead');
        // Fallback: create basic steps
        const projectPrefix = projectId.toLowerCase().replace(/[^a-z0-9]/g, '');
        const defaultSteps = [
          {
            step_id: `${projectPrefix}_greeting_${Date.now()}`,
            title: 'Begrüßung',
            description: 'Freundliche Begrüßung und Firmenvorstellung',
            communication: 'Guten Tag! Hier ist [Name] von [Firma]. Wie kann ich Ihnen heute helfen?',
            required: true,
            sort_order: 1,
            tenant_id: projectId,
            workflow_name: 'Gesprächsschritte',
            category: 'Begrüßung',
            step_type: 'normal',
            action_buttons: [
              {
                id: `action-${Date.now()}`,
                label: 'Weiter zum nächsten Schritt',
                variant: 'default',
                actionType: 'complete',
                icon: '✓',
                enabled: true
              }
            ]
          }
        ];

        const { error } = await supabase
          .from('call_steps')
          .insert(defaultSteps);
      
      if (error) {
        console.error('Error creating default steps:', error);
        throw error;
      }

      console.log('✅ Default workflow created successfully');
    } catch (error) {
      console.error('Error creating default workflow:', error);
    }
  };

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
      
      // Set default workflow - prioritize "Gesprächsschritte" as default
      if (uniqueWorkflows.length > 0 && !uniqueWorkflows.includes(currentWorkflow)) {
        const defaultWorkflow = uniqueWorkflows.includes('Gesprächsschritte') 
          ? 'Gesprächsschritte' 
          : uniqueWorkflows[0];
        console.log('📁 Setting default workflow to:', defaultWorkflow);
        setCurrentWorkflow(defaultWorkflow);
      } else if (uniqueWorkflows.length > 0 && !currentWorkflow) {
        // Also set default if no workflow is currently selected
        const defaultWorkflow = uniqueWorkflows.includes('Gesprächsschritte') 
          ? 'Gesprächsschritte' 
          : uniqueWorkflows[0];
        console.log('📁 No current workflow, setting default to:', defaultWorkflow);
        setCurrentWorkflow(defaultWorkflow);
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
          isTopicStep: step.is_topic_step || false,
          isServicePlusStep: step.is_service_plus_step || false,
          category: step.category || undefined,
          sortOrder: step.sort_order || 0,
          workflowName: step.workflow_name,
          actionButtons: ((step as any).action_buttons as ActionButton[]) || [],
          subSteps: [], // Will be populated separately if needed
          statusBackgroundColor: step.status_background_color || undefined,
          statusIcon: step.status_icon || undefined,
          parentTopicId: step.parent_topic_id || undefined,
          topicId: step.topic_id || undefined,
          imageUrl: (step as any).image_url || undefined
        }));
        
        // Organize sub-steps under their parent steps
        // Topic sub-steps (with parentTopicId) should be separate from normal sub-steps
        // Normal sub-steps (without parentTopicId) should be nested under their parent
        const topicSubSteps = formattedSteps.filter(step => step.parentTopicId);
        const normalSubSteps = formattedSteps.filter(step => step.parentStepId && step.stepType === 'sub_step' && !step.parentTopicId);
        const mainSteps = formattedSteps.filter(step => !step.parentStepId && step.stepType !== 'sub_step');
        
        console.log('📊 Loading steps for workflow:', targetWorkflow);
        console.log('📊 Total formatted steps:', formattedSteps.length);
        console.log('📊 Main steps:', mainSteps.length);
        console.log('📊 Normal sub steps:', normalSubSteps.length);
        console.log('📊 Topic sub steps:', topicSubSteps.length);
        console.log('📊 Main steps data:', mainSteps.map(s => ({id: s.id, title: s.title, sortOrder: s.sortOrder})));
        
        // Attach normal sub-steps to their parent steps
        mainSteps.forEach(mainStep => {
          mainStep.subSteps = normalSubSteps.filter(sub => sub.parentStepId === mainStep.id);
        });
        
        // Include both main steps and topic sub-steps in the final array
        // Topic sub-steps need to be in the array for getSubStepsForTopic to find them
        setSteps([...mainSteps, ...topicSubSteps]);
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
      console.log('💾 Saving step...', { 
        stepTitle: step.title, 
        isNew, 
        currentWorkflow,
        isTopicStep: step.isTopicStep,
        isServicePlusStep: step.isServicePlusStep 
      });
      
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
        status_icon: processedStep.statusIcon,
        is_topic_step: processedStep.isTopicStep || false,
        is_service_plus_step: processedStep.isServicePlusStep || false,
        parent_topic_id: processedStep.parentTopicId,
        image_url: processedStep.imageUrl
      };

      console.log('💾 Saving step data to database:', {
        ...stepData,
        step_id: processedStep.id
      });

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
      
      // Save sub-steps if they exist (but not topic sub-steps, they are saved separately)
      if (processedStep.subSteps && processedStep.subSteps.length > 0) {
        for (const subStep of processedStep.subSteps) {
          // Skip topic sub-steps as they are managed separately
          if (subStep.parentTopicId) continue;
          
          const subStepData = {
            title: subStep.title,
            description: subStep.description,
            communication: subStep.communication,
            required: subStep.required,
            parent_step_id: processedStep.id,
            step_type: 'sub_step',
            condition_label: subStep.conditionLabel,
            next_step_conditions: subStep.nextStepConditions,
            action_buttons: JSON.parse(JSON.stringify(subStep.actionButtons)) as Json || [],
            position_x: subStep.positionX || 0,
            position_y: subStep.positionY || 0,
            is_start_step: false,
            is_end_step: false,
            category: subStep.category,
            workflow_name: currentWorkflow,
            tenant_id: tenantId,
            status_background_color: subStep.statusBackgroundColor,
            status_icon: subStep.statusIcon,
            parent_topic_id: subStep.parentTopicId,
            is_topic_step: false,
            is_service_plus_step: false
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

  // Save a sub-step for a topic
  const saveStepWithTopic = async (step: CallStep, topicId: string): Promise<void> => {
    try {
      const stepWithTopic = {
        ...step,
        parentTopicId: topicId,
        stepType: 'sub_step' as const
      };
      
      // Check if step exists in database
      const { data: existingStep } = await supabase
        .from('call_steps')
        .select('id')
        .eq('step_id', step.id)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      const stepData = {
        title: stepWithTopic.title,
        description: stepWithTopic.description,
        communication: stepWithTopic.communication,
        required: stepWithTopic.required,
        parent_step_id: stepWithTopic.parentStepId,
        step_type: 'sub_step',
        next_step_conditions: stepWithTopic.nextStepConditions || [],
        action_buttons: JSON.parse(JSON.stringify(stepWithTopic.actionButtons || [])) as Json,
        position_x: 0,
        position_y: 0,
        is_start_step: false,
        is_end_step: false,
        is_topic_step: false,
        is_service_plus_step: false,
        category: stepWithTopic.category,
        workflow_name: currentWorkflow,
        tenant_id: tenantId,
        parent_topic_id: topicId,
        status_background_color: stepWithTopic.statusBackgroundColor,
        status_icon: stepWithTopic.statusIcon
      };

      if (!existingStep) {
        // Insert new sub-step
        const { error } = await supabase
          .from('call_steps')
          .insert({
            step_id: step.id,
            sort_order: 0,
            ...stepData
          });

        if (error) throw error;
        toast({ title: 'Unterschritt erstellt' });
      } else {
        // Update existing sub-step
        const { error } = await supabase
          .from('call_steps')
          .update(stepData)
          .eq('step_id', step.id)
          .eq('tenant_id', tenantId);

        if (error) throw error;
        toast({ title: 'Unterschritt aktualisiert' });
      }
      
      await loadSteps();
    } catch (error) {
      console.error('Error saving topic sub-step:', error);
      toast({
        title: 'Fehler beim Speichern',
        description: 'Der Unterschritt konnte nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
  };

  // Delete a topic sub-step
  const deleteTopicSubStep = async (subStepId: string, topicId: string): Promise<void> => {
    await deleteStep(subStepId);
  };

  // Get sub-steps for a specific topic
  const getSubStepsForTopic = (topicId: string): CallStep[] => {
    return steps.filter(step => step.parentTopicId === topicId);
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
    if (tenantId && tenantId !== 'default') {
      console.log('🏢 Tenant changed, reloading data for:', tenantId);
      
      // Always create default workflow for non-default projects
      createDefaultWorkflow(tenantId).then(() => {
        console.log('🏢 Default workflow creation completed, loading workflows...');
        loadWorkflows().then(() => {
          console.log('🏢 Workflows loaded, loading steps...');
          loadSteps();
        });
        loadButtonTemplates();
      });
    } else if (tenantId === 'default') {
      loadWorkflows().then(() => {
        loadSteps();
      });
      loadButtonTemplates();
    }
  }, [tenantId]);

  // Also listen for custom project change events
  useEffect(() => {
    const handleProjectChange = (event: CustomEvent) => {
      console.log('🏢 Project changed event received:', event.detail);
      // Small delay to ensure tenantId is updated
      setTimeout(() => {
        loadWorkflows();
        loadSteps();
        loadButtonTemplates();
      }, 100);
    };

    window.addEventListener('projectChanged', handleProjectChange as EventListener);
    return () => window.removeEventListener('projectChanged', handleProjectChange as EventListener);
  }, []);

  // Ensure default template exists after loading templates
  useEffect(() => {
    if (buttonTemplates.length > 0) {
      ensureDefaultTemplate();
    }
  }, [buttonTemplates]);

  // Load template into current project
  const loadTemplateIntoProject = async (templateId: string, templateName: string) => {
    try {
      setLoading(true);
      console.log('📋 Loading template into project:', templateName);
      
      // Fetch the template
      const { data: template, error: templateError } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (templateError) throw templateError;
      if (!template) {
        throw new Error('Template not found');
      }
      
      const templateData = template.template_data as any;
      
      // Clear existing steps for this workflow
      const { error: deleteError } = await supabase
        .from('call_steps')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('workflow_name', templateName);
      
      if (deleteError) throw deleteError;
      
      // Insert steps from template
      if (templateData.steps && templateData.steps.length > 0) {
        const stepsToInsert = templateData.steps.map((step: any) => ({
          ...step,
          tenant_id: tenantId,
          workflow_name: templateName,
          step_id: `${tenantId.toLowerCase()}_${step.step_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        
        const { error: stepsError } = await supabase
          .from('call_steps')
          .insert(stepsToInsert);
        
        if (stepsError) throw stepsError;
      }
      
      // Insert topics from template
      if (templateData.topics && templateData.topics.length > 0) {
        // First, clear existing topics
        await supabase
          .from('topics')
          .delete()
          .eq('tenant_id', tenantId);
        
        const topicsToInsert = templateData.topics.map((topic: any) => ({
          ...topic,
          tenant_id: tenantId,
          id: undefined // Let DB generate new IDs
        }));
        
        await supabase
          .from('topics')
          .insert(topicsToInsert);
      }
      
      // Insert button templates from template
      if (templateData.button_templates && templateData.button_templates.length > 0) {
        // Check which templates already exist
        const { data: existing } = await supabase
          .from('button_templates')
          .select('name')
          .eq('tenant_id', tenantId);
        
        const existingNames = new Set(existing?.map(t => t.name) || []);
        
        const templatesToInsert = templateData.button_templates
          .filter((template: any) => !existingNames.has(template.name))
          .map((template: any) => ({
            ...template,
            tenant_id: tenantId,
            id: undefined // Let DB generate new IDs
          }));
        
        if (templatesToInsert.length > 0) {
          await supabase
            .from('button_templates')
            .insert(templatesToInsert);
        }
      }
      
      // Reload everything
      await loadWorkflows();
      await loadButtonTemplates();
      await loadSteps();
      
      toast({
        title: "Template geladen",
        description: `"${template.name}" wurde erfolgreich in dein Projekt geladen`,
      });
      
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: "Fehler",
        description: "Template konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    loadButtonTemplates,
    saveStepWithTopic,
    deleteTopicSubStep,
    getSubStepsForTopic,
    loadTemplateIntoProject
  };
}