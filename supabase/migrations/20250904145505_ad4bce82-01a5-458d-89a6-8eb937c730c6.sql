-- Fix the search path security issue for the existing function
CREATE OR REPLACE FUNCTION public.set_proposal_user_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Automatically set user_id to the current authenticated user
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;