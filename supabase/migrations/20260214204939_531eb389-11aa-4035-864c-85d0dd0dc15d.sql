
-- Create mynd_pets table for persistent pet customization
CREATE TABLE public.mynd_pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  base_color TEXT NOT NULL DEFAULT '#F9A8D4',
  accessory TEXT NOT NULL DEFAULT 'star_halo',
  eye_color TEXT NOT NULL DEFAULT '#1E1B2E',
  blush_color TEXT NOT NULL DEFAULT '#FCA5A5',
  expression TEXT NOT NULL DEFAULT 'HAPPY',
  last_chat_expression TEXT NOT NULL DEFAULT 'HAPPY',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mynd_pets ENABLE ROW LEVEL SECURITY;

-- Users can read their own pet
CREATE POLICY "Users can view their own pet"
ON public.mynd_pets
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own pet
CREATE POLICY "Users can create their own pet"
ON public.mynd_pets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pet
CREATE POLICY "Users can update their own pet"
ON public.mynd_pets
FOR UPDATE
USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_mynd_pets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_mynd_pets_updated_at
BEFORE UPDATE ON public.mynd_pets
FOR EACH ROW
EXECUTE FUNCTION public.update_mynd_pets_updated_at();
