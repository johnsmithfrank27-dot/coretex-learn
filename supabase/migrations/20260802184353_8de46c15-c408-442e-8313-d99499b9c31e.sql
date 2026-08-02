CREATE POLICY "Users delete own flashcards" ON public.flashcards FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Users delete own quizzes" ON public.quizzes FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Users delete own posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);