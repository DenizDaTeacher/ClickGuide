import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Objection, Response, ObjectionWithResponses } from '@/types/topics';
import { useTenant } from './useTenant';
import { toast } from '@/hooks/use-toast';

export const useObjections = () => {
  const { tenantId } = useTenant();
  const [objections, setObjections] = useState<ObjectionWithResponses[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchObjections = async () => {
    if (!tenantId) return;
    
    try {
      // First, try to load tenant-specific objections
      const { data: tenantObjectionsData, error: tenantObjectionsError } = await supabase
        .from('objections')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (tenantObjectionsError) throw tenantObjectionsError;

      // If tenant has no objections, load from 'default'
      let objectionsData = tenantObjectionsData;
      if (!tenantObjectionsData || tenantObjectionsData.length === 0) {
        const { data: defaultObjectionsData, error: defaultObjectionsError } = await supabase
          .from('objections')
          .select('*')
          .eq('tenant_id', 'default')
          .eq('is_active', true)
          .order('priority', { ascending: false });

        if (defaultObjectionsError) throw defaultObjectionsError;
        objectionsData = defaultObjectionsData;
      }

      // Load responses for the objections we have
      const objectionIds = (objectionsData || []).map(o => o.id);
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .in('objection_id', objectionIds)
        .order('sort_order', { ascending: true });

      if (responsesError) throw responsesError;

      const objectionsWithResponses: ObjectionWithResponses[] = (objectionsData || []).map(objection => ({
        ...objection,
        responses: (responsesData || [])
          .filter(r => r.objection_id === objection.id)
          .map(r => ({
            ...r,
            objection_id: r.objection_id || undefined,
            follow_up_steps: Array.isArray(r.follow_up_steps) 
              ? r.follow_up_steps as Array<{ title: string; description: string }>
              : [],
          })),
      }));

      setObjections(objectionsWithResponses);
    } catch (error) {
      console.error('Error fetching objections:', error);
      toast({
        title: 'Fehler beim Laden der Einwände',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveObjection = async (objection: Partial<Objection>): Promise<string | null> => {
    try {
      if (objection.id) {
        const { error } = await supabase
          .from('objections')
          .update({
            title: objection.title,
            description: objection.description,
            keywords: objection.keywords,
            updated_at: new Date().toISOString(),
          })
          .eq('id', objection.id);

        if (error) throw error;
        toast({ title: 'Einwand aktualisiert' });
        return objection.id;
      } else {
        const { data, error } = await supabase
          .from('objections')
          .insert({
            tenant_id: tenantId,
            title: objection.title || 'Neuer Einwand',
            description: objection.description,
            keywords: objection.keywords || [],
            category: null,
            priority: 0,
          })
          .select()
          .single();

        if (error) throw error;
        toast({ title: 'Einwand erstellt' });
        return data?.id || null;
      }
    } catch (error) {
      console.error('Error saving objection:', error);
      toast({
        title: 'Fehler beim Speichern',
        variant: 'destructive',
      });
      return null;
    } finally {
      await fetchObjections();
    }
  };

  const deleteObjection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('objections')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Einwand gelöscht' });
      await fetchObjections();
    } catch (error) {
      console.error('Error deleting objection:', error);
      toast({
        title: 'Fehler beim Löschen',
        variant: 'destructive',
      });
    }
  };

  const saveResponse = async (response: Partial<Response>) => {
    try {
      if (response.id) {
        const { error } = await supabase
          .from('responses')
          .update({
            response_text: response.response_text,
            follow_up_steps: response.follow_up_steps,
            sort_order: response.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', response.id);

        if (error) throw error;
        toast({ title: 'Antwort aktualisiert' });
      } else {
        const { error } = await supabase
          .from('responses')
          .insert({
            tenant_id: tenantId,
            objection_id: response.objection_id,
            response_text: response.response_text || '',
            follow_up_steps: response.follow_up_steps || [],
            sort_order: response.sort_order || 0,
          });

        if (error) throw error;
        toast({ title: 'Antwort erstellt' });
      }
      
      await fetchObjections();
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: 'Fehler beim Speichern',
        variant: 'destructive',
      });
    }
  };

  const deleteResponse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Antwort gelöscht' });
      await fetchObjections();
    } catch (error) {
      console.error('Error deleting response:', error);
      toast({
        title: 'Fehler beim Löschen',
        variant: 'destructive',
      });
    }
  };

  const findMatchingObjection = (userInput: string): ObjectionWithResponses | null => {
    const normalizedInput = userInput.toLowerCase().trim();
    
    for (const objection of objections) {
      if (objection.title.toLowerCase().includes(normalizedInput)) {
        return objection;
      }
      
      for (const keyword of objection.keywords) {
        if (normalizedInput.includes(keyword.toLowerCase())) {
          return objection;
        }
      }
    }
    
    return null;
  };

  useEffect(() => {
    fetchObjections();
  }, [tenantId]);

  return {
    objections,
    loading,
    saveObjection,
    deleteObjection,
    saveResponse,
    deleteResponse,
    findMatchingObjection,
    refetch: fetchObjections,
  };
};
