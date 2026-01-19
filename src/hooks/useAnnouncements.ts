import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Announcement {
  id: string;
  tenant_id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAnnouncements() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const tenantId = localStorage.getItem('selectedProject') || 'default';

  const fetchAnnouncement = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAnnouncement(data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const saveAnnouncement = async (content: string, title?: string, imageUrl?: string) => {
    try {
      if (announcement) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update({
            content,
            title: title || null,
            image_url: imageUrl || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', announcement.id);

        if (error) throw error;
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('announcements')
          .insert({
            tenant_id: tenantId,
            content,
            title: title || null,
            image_url: imageUrl || null
          });

        if (error) throw error;
      }

      toast({
        title: "Gespeichert",
        description: "Die Neuigkeiten wurden erfolgreich aktualisiert.",
      });

      await fetchAnnouncement();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: "Fehler",
        description: "Die Neuigkeiten konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const deleteAnnouncement = async () => {
    if (!announcement) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id);

      if (error) throw error;

      toast({
        title: "Gelöscht",
        description: "Die Neuigkeiten wurden gelöscht.",
      });

      setAnnouncement(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Fehler",
        description: "Die Neuigkeiten konnten nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  return {
    announcement,
    loading,
    saveAnnouncement,
    deleteAnnouncement,
    refetch: fetchAnnouncement
  };
}
