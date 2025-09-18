-- Add status_icon and status_background_color columns to button_templates table
ALTER TABLE public.button_templates 
ADD COLUMN status_icon text,
ADD COLUMN status_background_color text;