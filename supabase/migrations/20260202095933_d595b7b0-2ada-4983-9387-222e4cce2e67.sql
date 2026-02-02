-- Add delete policy for call_feedback
CREATE POLICY "Feedback can be deleted" 
ON public.call_feedback 
FOR DELETE 
USING (true);