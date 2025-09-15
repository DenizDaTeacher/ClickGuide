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
}

export function useCallSteps() {
  const [steps, setSteps] = useState<CallStep[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load steps from Supabase
  const loadSteps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('call_steps')
        .select('*')
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
          required: step.required
        }));
        setSteps(formattedSteps);
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

  // Save a step to Supabase
  const saveStep = async (step: CallStep, isNew: boolean = false) => {
    try {
      if (isNew) {
        // Insert new step
        const maxSortOrder = Math.max(...steps.map(s => steps.findIndex(step => step.id === s.id) + 1), 0);
        const { error } = await supabase
          .from('call_steps')
          .insert({
            step_id: step.id,
            title: step.title,
            description: step.description,
            communication: step.communication,
            required: step.required,
            sort_order: maxSortOrder + 1
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
          .update({
            title: step.title,
            description: step.description,
            communication: step.communication,
            required: step.required
          })
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

  // Load steps on mount
  useEffect(() => {
    loadSteps();
  }, []);

  return {
    steps,
    loading,
    saveStep,
    deleteStep,
    updateStepsLocally,
    reloadSteps: loadSteps
  };
}