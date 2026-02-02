import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Archive, Search, CalendarIcon, Star, Hash, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChecklistResponse, ScaleResponse } from '@/hooks/useCallFeedback';

interface FeedbackEntry {
  id: string;
  conversationId: string | null;
  workflowName: string;
  sessionId: string;
  checklistResponses: ChecklistResponse[];
  scaleResponses: ScaleResponse[];
  notes: string | null;
  overallRating: number | null;
  createdAt: string;
  emailSentAt: string | null;
}

export default function FeedbackArchive() {
  const { tenantId } = useTenant();
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchConversationId, setSearchConversationId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFeedback();
  }, [tenantId]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('call_feedback')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error fetching feedback:', error);
        return;
      }

      const entries: FeedbackEntry[] = (data || []).map((item) => ({
        id: item.id,
        conversationId: (item as any).conversation_id || null,
        workflowName: item.workflow_name,
        sessionId: item.session_id,
        checklistResponses: (item.checklist_responses as unknown) as ChecklistResponse[],
        scaleResponses: (item.scale_responses as unknown) as ScaleResponse[],
        notes: item.notes,
        overallRating: item.overall_rating,
        createdAt: item.created_at,
        emailSentAt: item.email_sent_at,
      }));

      setFeedbackEntries(entries);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredEntries = feedbackEntries.filter((entry) => {
    // Filter by conversation ID
    if (searchConversationId.trim()) {
      const searchLower = searchConversationId.toLowerCase().trim();
      const convId = entry.conversationId?.toLowerCase() || '';
      if (!convId.includes(searchLower)) {
        return false;
      }
    }

    // Filter by date
    if (selectedDate) {
      const entryDate = new Date(entry.createdAt);
      if (
        entryDate.getFullYear() !== selectedDate.getFullYear() ||
        entryDate.getMonth() !== selectedDate.getMonth() ||
        entryDate.getDate() !== selectedDate.getDate()
      ) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearchConversationId('');
    setSelectedDate(undefined);
  };

  const hasFilters = searchConversationId.trim() || selectedDate;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Feedback-Archiv wird geladen...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter
          </CardTitle>
          <CardDescription>
            Suche nach Konversations-ID oder Datum
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Conversation ID Search */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="searchConvId" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Konversations-ID
              </Label>
              <Input
                id="searchConvId"
                placeholder="z.B. 12345 oder ABC-123"
                value={searchConversationId}
                onChange={(e) => setSearchConversationId(e.target.value)}
                className="font-mono"
              />
            </div>

            {/* Date Picker */}
            <div className="flex-1 space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Datum
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {filteredEntries.length} von {feedbackEntries.length} Einträgen
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Filter zurücksetzen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Feedback-Archiv
          </CardTitle>
          <CardDescription>
            {feedbackEntries.length} abgegebene Bewertungen insgesamt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasFilters
                ? 'Keine Einträge für die gewählten Filter gefunden.'
                : 'Noch keine Feedback-Einträge vorhanden.'}
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredEntries.map((entry) => {
                  const isExpanded = expandedEntries.has(entry.id);
                  const createdAt = new Date(entry.createdAt);

                  return (
                    <div
                      key={entry.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      {/* Header - Always visible */}
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4 flex-wrap">
                          {/* Conversation ID */}
                          {entry.conversationId && (
                            <Badge variant="outline" className="font-mono gap-1">
                              <Hash className="h-3 w-3" />
                              {entry.conversationId}
                            </Badge>
                          )}

                          {/* Date & Time */}
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(createdAt, 'dd.MM.yyyy HH:mm', { locale: de })}
                          </span>

                          {/* Rating Stars */}
                          {entry.overallRating && (
                            <span className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    'h-4 w-4',
                                    star <= entry.overallRating!
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground/30'
                                  )}
                                />
                              ))}
                            </span>
                          )}

                          {/* Email Status */}
                          {entry.emailSentAt && (
                            <Badge variant="secondary" className="text-xs">
                              E-Mail versendet
                            </Badge>
                          )}
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 border-t bg-background">
                          {/* Workflow Info */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Workflow:</span>{' '}
                              <span className="font-medium">{entry.workflowName}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Session:</span>{' '}
                              <span className="font-mono text-xs">{entry.sessionId.substring(0, 8)}...</span>
                            </div>
                          </div>

                          {/* Checklist Responses */}
                          {entry.checklistResponses.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Checkliste</Label>
                              <div className="space-y-1">
                                {entry.checklistResponses.map((resp) => (
                                  <div
                                    key={resp.id}
                                    className={cn(
                                      'flex items-center gap-2 text-sm p-2 rounded',
                                      resp.answer ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'w-4 h-4 rounded-sm border flex items-center justify-center text-xs',
                                        resp.answer
                                          ? 'bg-green-500 border-green-500 text-white'
                                          : 'border-muted-foreground/30'
                                      )}
                                    >
                                      {resp.answer && '✓'}
                                    </span>
                                    <span>{resp.question}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Scale Responses */}
                          {entry.scaleResponses.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Selbsteinschätzung</Label>
                              <div className="space-y-2">
                                {entry.scaleResponses.map((resp) => (
                                  <div key={resp.id} className="p-2 rounded bg-muted/50 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">{resp.question}</span>
                                      <span className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={cn(
                                              'h-3 w-3',
                                              star <= resp.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-muted-foreground/30'
                                            )}
                                          />
                                        ))}
                                      </span>
                                    </div>
                                    {resp.notes && (
                                      <p className="text-xs text-muted-foreground italic pl-2 border-l-2 border-muted">
                                        {resp.notes}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {entry.notes && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Notizen
                              </Label>
                              <p className="text-sm p-3 rounded bg-muted/50 whitespace-pre-wrap">
                                {entry.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
