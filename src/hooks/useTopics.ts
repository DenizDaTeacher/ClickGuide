import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Topic } from '@/types/topics';
import { useTenant } from './useTenant';
import { toast } from '@/hooks/use-toast';

export const useTopics = () => {
  const { tenantId } = useTenant();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    if (!tenantId) return;
    
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: 'Fehler beim Laden der Anliegen',
        description: 'Die Anliegen konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTopic = async (topic: Partial<Topic>) => {
    try {
      if (topic.id) {
        const { error } = await supabase
          .from('topics')
          .update({
            name: topic.name,
            description: topic.description,
            icon: topic.icon,
            color: topic.color,
            sort_order: topic.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', topic.id);

        if (error) throw error;
        toast({ title: 'Anliegen aktualisiert' });
      } else {
        const { error } = await supabase
          .from('topics')
          .insert({
            tenant_id: tenantId,
            name: topic.name || 'Neues Anliegen',
            description: topic.description,
            icon: topic.icon,
            color: topic.color,
            sort_order: topic.sort_order || 0,
          });

        if (error) throw error;
        toast({ title: 'Anliegen erstellt' });
      }
      
      await fetchTopics();
    } catch (error) {
      console.error('Error saving topic:', error);
      toast({
        title: 'Fehler beim Speichern',
        variant: 'destructive',
      });
    }
  };

  const deleteTopic = async (id: string) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Anliegen gelöscht' });
      await fetchTopics();
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast({
        title: 'Fehler beim Löschen',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [tenantId]);

  return {
    topics,
    loading,
    saveTopic,
    deleteTopic,
    refetch: fetchTopics,
  };
};
