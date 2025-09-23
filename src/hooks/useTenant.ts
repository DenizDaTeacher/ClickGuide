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
    // Trigger immediate reload by dispatching custom event
    window.dispatchEvent(new CustomEvent('projectChanged', { detail: projectName }));
    loadTenant(projectName);
  };

  // Load tenant information
  const loadTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      console.log('🏢 Loading tenant data for:', tenantId);

      // For project-based system, create a virtual tenant
      const virtualTenant: Tenant = {
        id: tenantId,
        name: tenantId === 'default' ? 'Standard Projekt' : tenantId,
        domain: '',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🏢 Virtual tenant created:', virtualTenant);
      setCurrentTenant(virtualTenant);
      return virtualTenant;
    } catch (error) {
      console.error('🏢 Unexpected error loading tenant:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initialize tenant on mount and listen for project changes
  useEffect(() => {
    const tenantId = getTenantId();
    loadTenant(tenantId);
    
    // Listen for custom project change events
    const handleProjectChange = (e: CustomEvent) => {
      console.log('🏢 Project changed event:', e.detail);
      loadTenant(e.detail);
    };

    // Listen for localStorage changes (when project changes)
    const handleStorageChange = () => {
      const newTenantId = getTenantId();
      console.log('🏢 Storage changed, reloading:', newTenantId);
      loadTenant(newTenantId);
    };

    window.addEventListener('projectChanged', handleProjectChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('projectChanged', handleProjectChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array to avoid infinite loops

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