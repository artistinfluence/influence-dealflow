-- Remove the overly permissive legacy proposals policy that exposes email addresses
DROP POLICY IF EXISTS "Authenticated users can view legacy proposals" ON public.proposals;