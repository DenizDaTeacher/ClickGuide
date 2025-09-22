import { useState, useEffect } from "react";
import CallDashboard from "@/components/CallDashboard";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Button } from "@/components/ui/button";
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

  const handleChangeProject = () => {
    setShowProjectSelector(true);
  };

  const handleDeleteProject = () => {
    localStorage.removeItem('selectedProject');
    setProject('default');
    setShowProjectSelector(true);
  };

  const currentProjectName = localStorage.getItem('selectedProject') || 'Kein Projekt';

  return (
    <>
      <ProjectSelector 
        isOpen={showProjectSelector}
        onProjectSelect={handleProjectSelect}
      />
      
      <div className="space-y-6">
        {/* Projekt Header */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <h2 className="text-xl font-semibold">Aktuelles Projekt: {currentProjectName}</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleChangeProject}>
              Projekt wechseln
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Projekt löschen
            </Button>
          </div>
        </div>
        
        <CallDashboard />
      </div>
    </>
  );
};

export default Index;
