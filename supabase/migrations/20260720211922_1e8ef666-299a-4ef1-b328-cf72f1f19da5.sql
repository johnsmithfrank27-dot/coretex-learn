
-- Security definer helper to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE group_id = _group_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_group_moderator(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE group_id = _group_id AND user_id = _user_id AND role = 'moderator'
  )
$$;

-- Replace overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can see memberships for visible groups" ON public.study_group_members;

CREATE POLICY "Members and owners can view memberships"
ON public.study_group_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_group_member(group_id, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.study_groups sg
    WHERE sg.id = study_group_members.group_id AND sg.owner_id = auth.uid()
  )
);

-- Fix tautology in UPDATE policy
DROP POLICY IF EXISTS "Group owners or moderators can manage memberships" ON public.study_group_members;

CREATE POLICY "Group owners or moderators can update memberships"
ON public.study_group_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.study_groups sg
    WHERE sg.id = study_group_members.group_id AND sg.owner_id = auth.uid()
  )
  OR public.is_group_moderator(study_group_members.group_id, auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.study_groups sg
    WHERE sg.id = study_group_members.group_id AND sg.owner_id = auth.uid()
  )
  OR public.is_group_moderator(study_group_members.group_id, auth.uid())
);
