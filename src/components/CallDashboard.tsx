import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AgentMode from "@/components/AgentMode";
import EditorMode from "@/components/EditorMode";

interface CallStep {
  id: string;
  title: string;
  description: string;
  communication: string;
  completed: boolean;
  required: boolean;
}

const initialSteps: CallStep[] = [
  {
    id: "greeting",
    title: "Begrüßung",
    description: "Freundliche Begrüßung und Firmenvorstellung",
    communication: "Guten Tag! Hier ist [Name] von [Firma]. Wie kann ich Ihnen heute helfen?",
    completed: false,
    required: true
  },
  {
    id: "identification",
    title: "Kundenidentifikation",
    description: "Sicherheitsabfrage zur Identitätsprüfung",
    communication: "Zur Sicherheit benötige ich von Ihnen bitte Ihren vollständigen Namen und Ihr Geburtsdatum.",
    completed: false,
    required: true
  },
  {
    id: "verification",
    title: "Datenverifikation",
    description: "Zusätzliche Sicherheitsabfrage",
    communication: "Können Sie mir bitte noch Ihre aktuelle Adresse bestätigen?",
    completed: false,
    required: true
  },
  {
    id: "data-privacy",
    title: "Datenschutz",
    description: "Datenschutzhinweise mitteilen",
    communication: "Ich weise Sie darauf hin, dass unser Gespräch zu Qualitätszwecken aufgezeichnet wird.",
    completed: false,
    required: true
  },
  {
    id: "request-details",
    title: "Anliegen erfassen",
    description: "Detaillierte Aufnahme des Kundenanliegens",
    communication: "Können Sie mir Ihr Anliegen bitte genauer schildern?",
    completed: false,
    required: false
  }
];

export default function CallDashboard() {
  const [mode, setMode] = useState<'agent' | 'editor'>('agent');
  const [steps, setSteps] = useState<CallStep[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isEditorUnlocked, setIsEditorUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load steps from Supabase on component mount
  useEffect(() => {
    loadStepsFromDatabase();
  }, []);

  const loadStepsFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('call_steps')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading steps:', error);
        // Fallback to initial steps if database fails
        setSteps(initialSteps);
        toast({
          title: "Warnung",
          description: "Schritte konnten nicht geladen werden. Verwende Standardkonfiguration.",
          variant: "destructive",
        });
      } else if (data && data.length > 0) {
        // Convert database format to component format
        const convertedSteps: CallStep[] = data.map(dbStep => ({
          id: dbStep.step_id,
          title: dbStep.title,
          description: dbStep.description,
          communication: dbStep.communication,
          completed: false,
          required: dbStep.required
        }));
        setSteps(convertedSteps);
      } else {
        // No data in database, use initial steps
        setSteps(initialSteps);
        await saveInitialStepsToDatabase();
      }
    } catch (error) {
      console.error('Error loading steps:', error);
      setSteps(initialSteps);
    } finally {
      setLoading(false);
    }
  };

  const saveInitialStepsToDatabase = async () => {
    try {
      const dbSteps = initialSteps.map((step, index) => ({
        step_id: step.id,
        title: step.title,
        description: step.description,
        communication: step.communication,
        required: step.required,
        sort_order: index + 1
      }));

      await supabase.from('call_steps').insert(dbSteps);
    } catch (error) {
      console.error('Error saving initial steps:', error);
    }
  };

  const saveStepsToDatabase = async (updatedSteps: CallStep[]) => {
    try {
      // Delete all existing steps
      await supabase.from('call_steps').delete().neq('step_id', '');

      // Insert updated steps
      const dbSteps = updatedSteps.map((step, index) => ({
        step_id: step.id,
        title: step.title,
        description: step.description,
        communication: step.communication,
        required: step.required,
        sort_order: index + 1
      }));

      const { error } = await supabase.from('call_steps').insert(dbSteps);
      
      if (error) {
        console.error('Error saving steps:', error);
        toast({
          title: "Fehler",
          description: "Änderungen konnten nicht gespeichert werden.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Gespeichert",
          description: "Änderungen wurden erfolgreich gespeichert.",
        });
      }
    } catch (error) {
      console.error('Error saving steps:', error);
      toast({
        title: "Fehler",
        description: "Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleStepsUpdate = async (updatedSteps: CallStep[]) => {
    setSteps(updatedSteps);
    await saveStepsToDatabase(updatedSteps);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Konfiguration...</p>
        </div>
      </div>
    );
  }

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
        {mode === 'agent' ? (
          <AgentMode steps={steps} onStepsUpdate={handleStepsUpdate} />
        ) : (
          <EditorMode steps={steps} onStepsUpdate={handleStepsUpdate} />
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