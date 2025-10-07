import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/hooks/use-toast';
import { exportCallAnalyticsToExcel, CallAnalyticsData } from '@/utils/exportToExcel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function AnalyticsExport() {
  const { tenantId } = useTenant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('call_analytics')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('started_at', `${startDate}T00:00:00`)
        .lte('started_at', `${endDate}T23:59:59`)
        .order('started_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "Keine Daten",
          description: "Keine Analytics-Daten für den gewählten Zeitraum gefunden",
          variant: "destructive",
        });
        return;
      }

      exportCallAnalyticsToExcel(data as CallAnalyticsData[], `${tenantId}_call_analytics`);
      
      toast({
        title: "Export erfolgreich",
        description: `${data.length} Datensätze wurden exportiert`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Fehler",
        description: "Export fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Analytics Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Call Analytics exportieren</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Von Datum</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Bis Datum</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={handleExport} disabled={loading} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Exportiere...' : 'Als Excel exportieren'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
