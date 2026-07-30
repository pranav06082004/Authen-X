-- user_roles: restrict policies to authenticated role only
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- analyses: authenticated-only, remove admin access to raw inputs, add update/delete
DROP POLICY IF EXISTS "Admins can view all analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.analyses;

CREATE POLICY "Users can view their own analyses" ON public.analyses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analyses" ON public.analyses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analyses" ON public.analyses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analyses" ON public.analyses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Admin-safe view excluding sensitive user-submitted content
CREATE OR REPLACE VIEW public.analyses_admin_summary
WITH (security_invoker = on) AS
SELECT id, user_id, result, confidence, key_phrases, created_at
FROM public.analyses;

GRANT SELECT ON public.analyses_admin_summary TO authenticated;

-- Allow admins to read non-sensitive columns via the view's underlying table is blocked by RLS;
-- instead expose an admin-only security definer function returning non-sensitive columns.
CREATE OR REPLACE FUNCTION public.admin_list_analyses()
RETURNS TABLE (id uuid, user_id uuid, result text, confidence numeric, key_phrases text[], created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.user_id, a.result, a.confidence, a.key_phrases, a.created_at
  FROM public.analyses a
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
$$;

REVOKE ALL ON FUNCTION public.admin_list_analyses() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_analyses() TO authenticated;