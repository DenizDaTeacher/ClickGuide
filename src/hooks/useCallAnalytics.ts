import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { CallStep } from '@/hooks/useCallSteps';

interface CallSession {
  id?: string;
  sessionId: string;
  startedAt: Date;
  completedSteps: Array<{
    stepId: string;
    title: string;
    completedAt: string;
    category?: string;
  }>;
}

export function useCallAnalytics(workflowName: string, steps: CallStep[]) {
  const { tenantId } = useTenant();
  const [currentSession, setCurrentSession] = useState<CallSession | null>(null);
  const [userIp, setUserIp] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(generateSessionId());

  // Generate unique session ID
  function generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Fetch user IP address
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('unknown'));
  }, []);

  // Start tracking a new call session
  const startCallSession = async () => {
    const sessionId = sessionIdRef.current;
    const startedAt = new Date();

    const { data, error } = await supabase
      .from('call_analytics')
      .insert({
        tenant_id: tenantId,
        workflow_name: workflowName,
        session_id: sessionId,
        user_ip: userIp,
        started_at: startedAt.toISOString(),
        steps_total: steps.filter(s => s.stepType !== 'sub_step').length,
        steps_completed: 0,
        call_status: 'in_progress'
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting call session:', error);
      return;
    }

    setCurrentSession({
      id: data.id,
      sessionId,
      startedAt,
      completedSteps: []
    });

    console.log('📊 Call session started:', data.id);
  };

  // Track step completion
  const trackStepCompletion = async (step: CallStep) => {
    if (!currentSession) return;

    const completedStep = {
      stepId: step.id,
      title: step.title,
      completedAt: new Date().toISOString(),
      category: step.category
    };

    const updatedCompletedSteps = [...currentSession.completedSteps, completedStep];

    await supabase
      .from('call_analytics')
      .update({
        steps_completed: updatedCompletedSteps.length,
        completed_steps: updatedCompletedSteps
      })
      .eq('id', currentSession.id);

    setCurrentSession({
      ...currentSession,
      completedSteps: updatedCompletedSteps
    });

    console.log('📊 Step completed:', step.title);
  };

  // End call session
  const endCallSession = async (status: 'completed' | 'abandoned' = 'completed') => {
    if (!currentSession) return;

    const endedAt = new Date();
    const durationSeconds = Math.floor((endedAt.getTime() - currentSession.startedAt.getTime()) / 1000);

    await supabase
      .from('call_analytics')
      .update({
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSeconds,
        call_status: status
      })
      .eq('id', currentSession.id);

    console.log('📊 Call session ended:', status, 'Duration:', durationSeconds, 's');

    // Generate new session ID for next call
    sessionIdRef.current = generateSessionId();
    setCurrentSession(null);
  };

  return {
    startCallSession,
    trackStepCompletion,
    endCallSession,
    currentSession
  };
}
