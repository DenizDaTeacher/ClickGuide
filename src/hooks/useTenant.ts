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

  // Get tenant ID from various sources (domain, URL params, localStorage)
  const getTenantId = (): string => {
    console.log('🏢 DEBUG: Getting tenant ID...');
    console.log('🏢 DEBUG: Current URL:', window.location.href);
    console.log('🏢 DEBUG: Search params:', window.location.search);
    
    // 1. Check URL parameters first (e.g., ?tenant=team-kundenservice)
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    console.log('🏢 DEBUG: Tenant param from URL:', tenantParam);
    
    if (tenantParam) {
      console.log('🏢 Tenant from URL param:', tenantParam);
      return tenantParam;
    }

    // 2. Check domain mapping
    const hostname = window.location.hostname;
    console.log('🏢 Current hostname:', hostname);
    
    // Map domains to tenant IDs
    const domainMapping: Record<string, string> = {
      'team1.clickguide.com': 'team-kundenservice',
      'team2.clickguide.com': 'team-vertrieb', 
      'support.clickguide.com': 'team-support',
      'localhost': 'default',
      '127.0.0.1': 'default'
    };

    const tenantFromDomain = domainMapping[hostname];
    if (tenantFromDomain) {
      console.log('🏢 Tenant from domain:', tenantFromDomain);
      return tenantFromDomain;
    }

    // 3. Check for subdomain pattern (e.g., team-name.lovableproject.com)
    if (hostname.includes('.lovableproject.com')) {
      const subdomain = hostname.split('.')[0];
      if (subdomain.startsWith('team-') || subdomain === 'default') {
        console.log('🏢 Tenant from subdomain:', subdomain);
        return subdomain;
      }
    }

    // 4. Fallback to default
    console.log('🏢 Using default tenant');
    return 'default';
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
    refreshTenant: () => {
      const tenantId = getTenantId();
      loadTenant(tenantId);
    }
  };
}