
REVOKE ALL ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_group_moderator(uuid, uuid) FROM PUBLIC, anon, authenticated;
