import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

export interface ChecklistQuestion {
  id: string;
  question: string;
  required: boolean;
}

export interface ScaleQuestion {
  id: string;
  question: string;
  required: boolean;
  maxStars?: number;
}

export interface ChecklistResponse {
  id: string;
  question: string;
  answer: boolean;
}

export interface ScaleResponse {
  id: string;
  question: string;
  rating: number;
  notes?: string;
}

export interface FeedbackSettings {
  id: string;
  tenantId: string;
  feedbackRequired: boolean;
  checklistQuestions: ChecklistQuestion[];
  scaleQuestions: ScaleQuestion[];
  notificationEmails: string[];
}

export interface CallFeedback {
  id?: string;
  callAnalyticsId?: string;
  tenantId: string;
  workflowName: string;
  sessionId: string;
  checklistResponses: ChecklistResponse[];
  scaleResponses: ScaleResponse[];
  notes: string | null;
  overallRating: number | null;
  createdAt?: string;
  emailSentAt?: string | null;
}

export function useCallFeedback() {
  const { tenantId } = useTenant();
  const [settings, setSettings] = useState<FeedbackSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch feedback settings for tenant
  useEffect(() => {
    fetchSettings();
  }, [tenantId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching feedback settings:', error);
        return;
      }

      if (data) {
        setSettings({
          id: data.id,
          tenantId: data.tenant_id,
          feedbackRequired: data.feedback_required,
          checklistQuestions: (data.checklist_questions as unknown) as ChecklistQuestion[],
          scaleQuestions: (data.scale_questions as unknown) as ScaleQuestion[] || [],
          notificationEmails: (data.notification_emails as unknown) as string[],
        });
      } else {
        // Create default settings if none exist
        const defaultQuestions = [
          { id: 'all_steps', question: 'Alle Pflichtschritte erledigt?', required: true },
          { id: 'customer_satisfied', question: 'Kunde zufrieden?', required: true },
          { id: 'upsell_attempted', question: 'Cross-/Upselling versucht?', required: false },
        ];

        const defaultScaleQuestions = [
          { id: 'self_performance', question: 'Wie bewertest du deine eigene Leistung?', required: false, maxStars: 5 },
        ];

        const { data: newData, error: insertError } = await supabase
          .from('feedback_settings')
          .insert({
            tenant_id: tenantId,
            feedback_required: false,
            checklist_questions: defaultQuestions as unknown as any,
            scale_questions: defaultScaleQuestions as unknown as any,
            notification_emails: [] as unknown as any,
          })
          .select()
          .single();

        if (!insertError && newData) {
          setSettings({
            id: newData.id,
            tenantId: newData.tenant_id,
            feedbackRequired: newData.feedback_required,
            checklistQuestions: (newData.checklist_questions as unknown) as ChecklistQuestion[],
            scaleQuestions: (newData.scale_questions as unknown) as ScaleQuestion[] || [],
            notificationEmails: (newData.notification_emails as unknown) as string[],
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<FeedbackSettings>) => {
    if (!settings?.id) return;

    const { error } = await supabase
      .from('feedback_settings')
      .update({
        feedback_required: newSettings.feedbackRequired ?? settings.feedbackRequired,
        checklist_questions: (newSettings.checklistQuestions ?? settings.checklistQuestions) as unknown as any,
        scale_questions: (newSettings.scaleQuestions ?? settings.scaleQuestions) as unknown as any,
        notification_emails: (newSettings.notificationEmails ?? settings.notificationEmails) as unknown as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    if (error) {
      console.error('Error saving feedback settings:', error);
      return false;
    }

    setSettings({ ...settings, ...newSettings });
    return true;
  };

  const submitFeedback = async (
    feedback: Omit<CallFeedback, 'id' | 'tenantId' | 'createdAt' | 'emailSentAt'>,
    callAnalyticsId?: string,
    callDuration?: number,
    stepsCompleted?: number,
    stepsTotal?: number
  ) => {
    // Save feedback to database
    const { data, error } = await supabase
      .from('call_feedback')
      .insert({
        tenant_id: tenantId,
        call_analytics_id: callAnalyticsId,
        workflow_name: feedback.workflowName,
        session_id: feedback.sessionId,
        checklist_responses: feedback.checklistResponses as unknown as any,
        scale_responses: feedback.scaleResponses as unknown as any,
        notes: feedback.notes,
        overall_rating: feedback.overallRating,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving feedback:', error);
      return { success: false, error };
    }

    // Send email if recipients are configured
    if (settings?.notificationEmails && settings.notificationEmails.length > 0) {
      try {
        await supabase.functions.invoke('send-feedback-email', {
          body: {
            feedbackId: data.id,
            tenantId,
            workflowName: feedback.workflowName,
            checklistResponses: feedback.checklistResponses,
            scaleResponses: feedback.scaleResponses,
            notes: feedback.notes,
            overallRating: feedback.overallRating,
            callDuration,
            stepsCompleted,
            stepsTotal,
            recipientEmails: settings.notificationEmails,
          },
        });
      } catch (emailError) {
        console.error('Error sending feedback email:', emailError);
        // Don't fail the whole operation if email fails
      }
    }

    return { success: true, data };
  };

  return {
    settings,
    loading,
    fetchSettings,
    saveSettings,
    submitFeedback,
  };
}
