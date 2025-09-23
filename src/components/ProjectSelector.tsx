import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProjectSelectorProps {
  isOpen: boolean;
  onProjectSelect: (projectName: string) => void;
}

export function ProjectSelector({ isOpen, onProjectSelect }: ProjectSelectorProps) {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onProjectSelect(projectName.trim());
    }
  };

  const quickProjects = [
    'DEMO',
    'MEDIAMARKTSATURN',
    'EON',
    'DHL',
    '1&1'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center">Wähle dein Projekt</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Projektname eingeben:</Label>
            <Input
              id="project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="z.B. MediaMarktSaturn, DHL, etc."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Oder schnell auswählen:</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickProjects.map((project) => (
                <Button
                  key={project}
                  type="button"
                  variant="outline"
                  onClick={() => onProjectSelect(project)}
                  className="text-sm"
                >
                  {project}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!projectName.trim()}>
            Projekt starten
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}