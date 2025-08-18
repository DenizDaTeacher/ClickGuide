import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, User } from "lucide-react";
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
  const [steps, setSteps] = useState<CallStep[]>(initialSteps);

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
                  onClick={() => setMode('agent')}
                  className="text-xs"
                >
                  <User className="w-4 h-4 mr-1" />
                  Agent
                </Button>
                <Button
                  variant={mode === 'editor' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('editor')}
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
          <AgentMode steps={steps} onStepsUpdate={setSteps} />
        ) : (
          <EditorMode steps={steps} onStepsUpdate={setSteps} />
        )}
      </div>
    </div>
  );
}