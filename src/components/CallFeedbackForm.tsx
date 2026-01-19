import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send, SkipForward } from 'lucide-react';
import { useCallFeedback, ChecklistResponse } from '@/hooks/useCallFeedback';
import { toast } from 'sonner';

interface CallFeedbackFormProps {
  workflowName: string;
  sessionId: string;
  callAnalyticsId?: string;
  callDuration?: number;
  stepsCompleted: number;
  stepsTotal: number;
  onComplete: () => void;
  onSkip?: () => void;
}

export default function CallFeedbackForm({
  workflowName,
  sessionId,
  callAnalyticsId,
  callDuration,
  stepsCompleted,
  stepsTotal,
  onComplete,
  onSkip,
}: CallFeedbackFormProps) {
  const { settings, submitFeedback } = useCallFeedback();
  const [responses, setResponses] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setResponses(prev => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async () => {
    if (!settings) return;

    // Check required fields
    const requiredQuestions = settings.checklistQuestions.filter(q => q.required);
    const allRequiredAnswered = requiredQuestions.every(q => responses[q.id] !== undefined);

    if (!allRequiredAnswered) {
      toast.error('Bitte beantworte alle Pflichtfragen');
      return;
    }

    setSubmitting(true);

    const checklistResponses: ChecklistResponse[] = settings.checklistQuestions.map(q => ({
      id: q.id,
      question: q.question,
      answer: responses[q.id] ?? false,
    }));

    const result = await submitFeedback(
      {
        workflowName,
        sessionId,
        checklistResponses,
        notes: notes || null,
        overallRating: rating,
      },
      callAnalyticsId,
      callDuration,
      stepsCompleted,
      stepsTotal
    );

    setSubmitting(false);

    if (result.success) {
      toast.success('Feedback erfolgreich gespeichert!');
      onComplete();
    } else {
      toast.error('Fehler beim Speichern des Feedbacks');
    }
  };

  if (!settings) {
    return null;
  }

  const canSkip = !settings.feedbackRequired && onSkip;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Call-Bewertung
        </CardTitle>
        <CardDescription>
          Bewerte deinen Call und hilf uns, die Qualität zu verbessern.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="space-y-2">
          <Label>Gesamtbewertung</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating ?? rating ?? 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <Label>Checkliste</Label>
          {settings.checklistQuestions.map((question) => (
            <div key={question.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <Checkbox
                id={question.id}
                checked={responses[question.id] ?? false}
                onCheckedChange={(checked) => handleCheckboxChange(question.id, checked as boolean)}
              />
              <label
                htmlFor={question.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
              >
                {question.question}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </label>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notizen (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Besondere Vorkommnisse, Verbesserungsvorschläge, Kundenfeedback..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        {/* Call Stats Summary */}
        <div className="p-4 rounded-lg bg-muted/50 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Workflow:</span>{' '}
              <span className="font-medium">{workflowName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Schritte:</span>{' '}
              <span className="font-medium">{stepsCompleted}/{stepsTotal}</span>
            </div>
            {callDuration && (
              <div>
                <span className="text-muted-foreground">Dauer:</span>{' '}
                <span className="font-medium">
                  {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')} min
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {canSkip && (
            <Button variant="ghost" onClick={onSkip}>
              <SkipForward className="h-4 w-4 mr-2" />
              Überspringen
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? 'Senden...' : 'Feedback senden'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
