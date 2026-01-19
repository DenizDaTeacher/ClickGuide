-- Add columns for image size and position
ALTER TABLE public.announcements 
ADD COLUMN image_width INTEGER DEFAULT NULL,
ADD COLUMN image_position TEXT DEFAULT 'center';