-- Add user_id column to proposals table to track ownership
ALTER TABLE public.proposals 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing proposals to have a default user_id (you may want to set this to a specific admin user)
-- For now, we'll leave existing records with NULL user_id which admin policies can handle

-- Create RLS policies for proposals table

-- Policy 1: Users can only view their own proposals
CREATE POLICY "Users can view their own proposals" 
ON public.proposals 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Allow viewing proposals where user_id is NULL (for existing records) - only for authenticated users
CREATE POLICY "Authenticated users can view legacy proposals" 
ON public.proposals 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND user_id IS NULL);

-- Policy 3: Update the existing insert policy to automatically set user_id
DROP POLICY IF EXISTS "Allow proposal insertions" ON public.proposals;

CREATE POLICY "Users can create their own proposals" 
ON public.proposals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own proposals
CREATE POLICY "Users can update their own proposals" 
ON public.proposals 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy 5: Users can delete their own proposals
CREATE POLICY "Users can delete their own proposals" 
ON public.proposals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create a function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION public.set_proposal_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set user_id to the current authenticated user
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id
CREATE TRIGGER set_proposal_user_id_trigger
  BEFORE INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_proposal_user_id();