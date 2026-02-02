import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Mail, ListChecks, GripVertical, Star } from 'lucide-react';
import { useCallFeedback, ChecklistQuestion, ScaleQuestion } from '@/hooks/useCallFeedback';
import { toast } from 'sonner';

export default function FeedbackSettingsEditor() {
  const { settings, loading, saveSettings } = useCallFeedback();
  const [feedbackRequired, setFeedbackRequired] = useState(false);
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [scaleQuestions, setScaleQuestions] = useState<ScaleQuestion[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newScaleQuestion, setNewScaleQuestion] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFeedbackRequired(settings.feedbackRequired);
      setQuestions(settings.checklistQuestions);
      setScaleQuestions(settings.scaleQuestions || []);
      setEmails(settings.notificationEmails);
    }
  }, [settings]);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const newQ: ChecklistQuestion = {
      id: `q_${Date.now()}`,
      question: newQuestion.trim(),
      required: false,
    };
    setQuestions([...questions, newQ]);
    setNewQuestion('');
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleToggleRequired = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, required: !q.required } : q
    ));
  };

  const handleAddScaleQuestion = () => {
    if (!newScaleQuestion.trim()) return;
    
    const newQ: ScaleQuestion = {
      id: `scale_${Date.now()}`,
      question: newScaleQuestion.trim(),
      required: false,
      maxStars: 5,
    };
    setScaleQuestions([...scaleQuestions, newQ]);
    setNewScaleQuestion('');
  };

  const handleRemoveScaleQuestion = (id: string) => {
    setScaleQuestions(scaleQuestions.filter(q => q.id !== id));
  };

  const handleToggleScaleRequired = (id: string) => {
    setScaleQuestions(scaleQuestions.map(q => 
      q.id === id ? { ...q, required: !q.required } : q
    ));
  };

  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Ungültige E-Mail-Adresse');
      return;
    }
    if (emails.includes(email)) {
      toast.error('E-Mail bereits hinzugefügt');
      return;
    }
    setEmails([...emails, email]);
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await saveSettings({
      feedbackRequired,
      checklistQuestions: questions,
      scaleQuestions,
      notificationEmails: emails,
    });
    setSaving(false);
    
    if (success) {
      toast.success('Einstellungen gespeichert!');
    } else {
      toast.error('Fehler beim Speichern');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Einstellungen werden geladen...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Feedback-Einstellungen
          </CardTitle>
          <CardDescription>
            Konfiguriere, wie Agents nach einem Call Feedback geben können.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label className="text-base">Feedback verpflichtend</Label>
              <p className="text-sm text-muted-foreground">
                Agent muss Feedback abgeben, bevor ein neuer Call gestartet werden kann
              </p>
            </div>
            <Switch
              checked={feedbackRequired}
              onCheckedChange={setFeedbackRequired}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Checkliste-Fragen</CardTitle>
          <CardDescription>
            Fragen, die der Agent nach jedem Call beantworten soll.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <span className="flex-1">{question.question}</span>
              <Badge
                variant={question.required ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => handleToggleRequired(question.id)}
              >
                {question.required ? 'Pflicht' : 'Optional'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <Input
              placeholder="Neue Frage hinzufügen..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
            />
            <Button variant="outline" onClick={handleAddQuestion}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scale Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Skalenfragen
          </CardTitle>
          <CardDescription>
            Fragen mit Sternebewertung und optionalem Notizfeld für Selbsteinschätzung.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scaleQuestions.map((question) => (
            <div
              key={question.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <div className="flex items-center gap-1 text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <span className="flex-1">{question.question}</span>
              <Badge
                variant={question.required ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => handleToggleScaleRequired(question.id)}
              >
                {question.required ? 'Pflicht' : 'Optional'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveScaleQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <Input
              placeholder="Neue Skalenfrage hinzufügen..."
              value={newScaleQuestion}
              onChange={(e) => setNewScaleQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddScaleQuestion()}
            />
            <Button variant="outline" onClick={handleAddScaleQuestion}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Mail-Benachrichtigungen
          </CardTitle>
          <CardDescription>
            Diese E-Mail-Adressen erhalten nach jedem abgeschlossenen Feedback einen Bericht.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {emails.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine E-Mail-Empfänger konfiguriert. Feedbacks werden nur gespeichert, aber nicht versendet.
              </p>
            ) : (
              emails.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1 py-1">
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="E-Mail-Adresse hinzufügen..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <Button variant="outline" onClick={handleAddEmail}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Speichern...' : 'Einstellungen speichern'}
        </Button>
      </div>
    </div>
  );
}
