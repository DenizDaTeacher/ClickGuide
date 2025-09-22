import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTenant() {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // Get tenant ID from localStorage (project-based system)
  const getTenantId = (): string => {
    // Check localStorage for selected project
    const savedProject = localStorage.getItem('selectedProject');
    if (savedProject) {
      console.log('🏢 Using saved project:', savedProject);
      return savedProject;
    }

    // Fallback to default if no project selected
    console.log('🏢 No project selected, using default');
    return 'default';
  };

  // Set tenant ID (when user selects a project)
  const setTenantId = (projectName: string) => {
    localStorage.setItem('selectedProject', projectName);
    loadTenant(projectName);
  };

  // Load tenant information
  const loadTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      console.log('🏢 Loading tenant data for:', tenantId);

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('🏢 Error loading tenant:', error);
        // If tenant not found, create it or use default
        if (tenantId !== 'default') {
          console.log('🏢 Tenant not found, falling back to default');
          return await loadTenant('default');
        }
        return null;
      }

      console.log('🏢 Tenant loaded:', data);
      setCurrentTenant(data);
      return data;
    } catch (error) {
      console.error('🏢 Unexpected error loading tenant:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initialize tenant on mount
  useEffect(() => {
    const tenantId = getTenantId();
    loadTenant(tenantId);
  }, []);

  // Listen for URL changes to switch tenants
  useEffect(() => {
    const handleLocationChange = () => {
      const newTenantId = getTenantId();
      if (currentTenant && newTenantId !== currentTenant.id) {
        console.log('🏢 Tenant changed, reloading:', newTenantId);
        loadTenant(newTenantId);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [currentTenant]);

  return {
    tenant: currentTenant,
    tenantId: currentTenant?.id || 'default',
    loading,
    setProject: setTenantId,
    refreshTenant: () => {
      const tenantId = getTenantId();
      loadTenant(tenantId);
    }
  };
}