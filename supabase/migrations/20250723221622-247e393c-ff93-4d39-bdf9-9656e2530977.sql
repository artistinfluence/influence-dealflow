-- Create a simple table to track proposal generation (optional for analytics)
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  song_title TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  services_included JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insertions (no user auth required for sales portal)
CREATE POLICY "Allow proposal insertions" 
ON public.proposals 
FOR INSERT 
WITH CHECK (true);