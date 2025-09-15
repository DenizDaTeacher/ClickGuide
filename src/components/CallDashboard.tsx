import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, User } from "lucide-react";
import AgentMode from "@/components/AgentMode";
import EditorMode from "@/components/EditorMode";
import { useCallSteps } from "@/hooks/useCallSteps";

export default function CallDashboard() {
  const [mode, setMode] = useState<'agent' | 'editor'>('agent');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isEditorUnlocked, setIsEditorUnlocked] = useState(false);
  
  const { steps, loading, updateStepsLocally } = useCallSteps();

  const handleEditorAccess = () => {
    if (password === "CCONE777") {
      setIsEditorUnlocked(true);
      setMode('editor');
      setShowPasswordDialog(false);
      setPassword("");
    } else {
      alert("Falsches Passwort!");
      setPassword("");
    }
  };

  const handleModeSwitch = (newMode: 'agent' | 'editor') => {
    if (newMode === 'editor' && !isEditorUnlocked) {
      setShowPasswordDialog(true);
    } else {
      setMode(newMode);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">ClickGuide</h1>
              <p className="text-muted-foreground mt-1">Intelligenter Gesprächsleitfaden für Agenten</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Mode Toggle */}
              <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={mode === 'agent' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeSwitch('agent')}
                  className="text-xs"
                >
                  <User className="w-4 h-4 mr-1" />
                  Agent
                </Button>
                <Button
                  variant={mode === 'editor' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeSwitch('editor')}
                  className="text-xs"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Editor
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on mode */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Lade Schritte...</div>
          </div>
        ) : mode === 'agent' ? (
          <AgentMode steps={steps} onStepsUpdate={updateStepsLocally} />
        ) : (
          <EditorMode steps={steps} />
        )}

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editor-Zugang</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bitte geben Sie das Passwort ein, um in den Editor-Modus zu wechseln:
              </p>
              <Input
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEditorAccess()}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleEditorAccess}>
                  Zugang
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}