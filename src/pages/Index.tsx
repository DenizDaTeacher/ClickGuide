import { useState, useEffect } from "react";
import CallDashboard from "@/components/CallDashboard";
import { TenantInfo } from "@/components/TenantInfo";
import { TenantManagement } from "@/components/TenantManagement";
import { ProjectSelector } from "@/components/ProjectSelector";
import { useTenant } from "@/hooks/useTenant";

const Index = () => {
  const { tenant, setProject } = useTenant();
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  useEffect(() => {
    // Show project selector if no project is selected or if it's the default
    const savedProject = localStorage.getItem('selectedProject');
    if (!savedProject || savedProject === 'default') {
      setShowProjectSelector(true);
    }
  }, []);

  const handleProjectSelect = (projectName: string) => {
    setProject(projectName);
    setShowProjectSelector(false);
  };

  return (
    <>
      <ProjectSelector 
        isOpen={showProjectSelector}
        onProjectSelect={handleProjectSelect}
      />
      
      <div className="space-y-6">
        <TenantInfo />
        <CallDashboard />
        
        {/* Admin-Bereich für Team-Verwaltung */}
        <div className="border-t pt-6">
          <TenantManagement />
        </div>
      </div>
    </>
  );
};

export default Index;
