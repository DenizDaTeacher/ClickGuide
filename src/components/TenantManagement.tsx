import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Building2, Plus, Pencil, Globe, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/hooks/useTenant';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    domain: '',
    is_active: true
  });

  // Load all tenants
  const loadTenants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tenants:', error);
        toast.error('Fehler beim Laden der Teams');
        return;
      }

      setTenants(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Unerwarteter Fehler beim Laden der Teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Save tenant (create or update)
  const saveTenant = async () => {
    try {
      if (!formData.id || !formData.name) {
        toast.error('ID und Name sind erforderlich');
        return;
      }

      const tenantData = {
        id: formData.id,
        name: formData.name,
        domain: formData.domain || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingTenant) {
        // Update existing tenant
        const { error } = await supabase
          .from('tenants')
          .update(tenantData)
          .eq('id', editingTenant.id);

        if (error) {
          console.error('Error updating tenant:', error);
          toast.error('Fehler beim Aktualisieren des Teams');
          return;
        }

        toast.success('Team erfolgreich aktualisiert');
      } else {
        // Create new tenant
        const { error } = await supabase
          .from('tenants')
          .insert({
            ...tenantData,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating tenant:', error);
          toast.error('Fehler beim Erstellen des Teams');
          return;
        }

        toast.success('Team erfolgreich erstellt');
      }

      // Reset form and reload
      setFormData({ id: '', name: '', domain: '', is_active: true });
      setEditingTenant(null);
      setIsDialogOpen(false);
      loadTenants();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Unerwarteter Fehler beim Speichern');
    }
  };

  // Start editing a tenant
  const startEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain || '',
      is_active: tenant.is_active
    });
    setIsDialogOpen(true);
  };

  // Start creating new tenant
  const startCreate = () => {
    setEditingTenant(null);
    setFormData({ id: '', name: '', domain: '', is_active: true });
    setIsDialogOpen(true);
  };

  // Toggle tenant active status
  const toggleTenantStatus = async (tenant: Tenant) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ 
          is_active: !tenant.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id);

      if (error) {
        console.error('Error toggling tenant status:', error);
        toast.error('Fehler beim Ändern des Status');
        return;
      }

      toast.success(`Team ${!tenant.is_active ? 'aktiviert' : 'deaktiviert'}`);
      loadTenants();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Unerwarteter Fehler');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Team-Verwaltung</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Teams werden geladen...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Team-Verwaltung</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCreate} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Neues Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTenant ? 'Team bearbeiten' : 'Neues Team erstellen'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant-id">Team-ID</Label>
                  <Input
                    id="tenant-id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="z.B. team-vertrieb"
                    disabled={!!editingTenant}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: team-name (nur beim Erstellen änderbar)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tenant-name">Team-Name</Label>
                  <Input
                    id="tenant-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Vertrieb"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tenant-domain">Domain (optional)</Label>
                  <Input
                    id="tenant-domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="z.B. vertrieb.clickguide.com"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tenant-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="tenant-active">Team aktiv</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button onClick={saveTenant}>
                    {editingTenant ? 'Aktualisieren' : 'Erstellen'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tenants.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Keine Teams gefunden</p>
              <p className="text-sm text-muted-foreground">
                Erstellen Sie Ihr erstes Team über den Button oben
              </p>
            </div>
          ) : (
            tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-medium">{tenant.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {tenant.id}</p>
                      {tenant.domain && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{tenant.domain}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant={tenant.is_active ? "default" : "secondary"}>
                    {tenant.is_active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(tenant)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    
                    <Switch
                      checked={tenant.is_active}
                      onCheckedChange={() => toggleTenantStatus(tenant)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">💡 Domain-Setup Hinweise:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Teams können über URL-Parameter aufgerufen werden: <code>?tenant=team-kundenservice</code></li>
            <li>• Für eigene Domains: DNS A-Record auf 185.158.133.1 setzen</li>
            <li>• Subdomains werden automatisch erkannt: <code>team-name.lovableproject.com</code></li>
            <li>• Details siehe <code>MULTI_TENANT_SETUP.md</code> Datei</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}