## Goal
Turn Coretex from a static UI into a working app with real accounts, real user data, saved AI conversations, working buttons on every page, and clean SEO. No dummy content — every list starts empty until the user creates something.

## Phase 1 — Foundation (Cloud + Auth)
- Enable Lovable Cloud (Supabase under the hood) and provision `LOVABLE_API_KEY` for AI.
- Wire `/login` and `/signup` to real email/password + Google sign-in.
- Add a `profiles` table (username, display name, avatar, school, grade, subjects, goals, XP, streak) with RLS scoped to `auth.uid()` and an auto-create trigger on signup.
- Gate `/app/*` behind the managed `_authenticated` layout. Signed-out users hitting `/app` bounce to `/login`.
- Header on landing shows Sign in / Get started when logged out, and Open app / avatar menu when logged in.
- Sign-out from the sidebar clears cache and returns to `/`.

## Phase 2 — AI Tutor with memory (localStorage, threaded)
- Move `/api/chat` from Groq to Lovable AI Gateway (`google/gemini-3-flash-preview`) via the AI SDK. Delete `GROQ_API_KEY` usage.
- Rebuild AI Tutor with `useChat` + `DefaultChatTransport`.
- Threaded conversations stored in browser localStorage: sidebar of past chats, "New chat" button, rename, delete. Each thread has its own URL: `/app/ai-tutor/$threadId`.
- Auto-title new threads from the first user message.
- All suggestion chips and quick-action buttons wire into `sendMessage`.

## Phase 3 — CRUD features (real data per user)
Tables (all `TO authenticated` with `auth.uid() = user_id` RLS + proper GRANTs):
- `notes` (title, content, subject, updated_at)
- `flashcard_decks` + `flashcards` (front, back, deck_id)
- `quizzes` + `quiz_questions` + `quiz_attempts`
- `study_groups` + `study_group_members` (join/leave)
- `posts` + `post_likes` + `post_comments` (Social feed)
- `events` (calendar)
- `resources` (saved links)

For every page: replace hardcoded arrays with queries, add Create / Edit / Delete affordances, and show a real empty state ("No notes yet — create your first one") when the user has none.

## Phase 4 — Progress, Leaderboard, Streak (derived)
- Track XP and streak on `profiles`, updated by triggers on quiz_attempts and post creation.
- Progress page reads real stats from the user's activity.
- Leaderboard queries the top profiles by XP (all users can read a narrow public column set via a `TO authenticated` policy on `profiles`).

## Phase 5 — Wire remaining buttons
Sidebar links, top-nav search, settings form (updates profile + avatar upload to a `avatars` public bucket), calendar event create/delete, resources add/remove, share/like/comment on social posts, join/leave study groups, "Ask AI" from a post opens AI Tutor with that post as context.

## Phase 6 — SEO + polish
- Per-route `head()` with unique title/description on landing, login, signup, and each app page.
- Real `robots.txt` + `sitemap.xml` for public routes only.
- Trigger the SEO scan and fix reported findings.
- Alt text on every image, single H1 per route, semantic landmarks.

## Technical notes
- Server: TanStack `createServerFn` for CRUD, `/api/chat` server route for streaming. `requireSupabaseAuth` middleware on all protected fns.
- Client bearer attacher stays wired in `src/start.ts`.
- Images: keep existing generated art as decorative assets only; content areas use user data.
- Route files: `src/routes/_authenticated/app.*.tsx` for protected app pages. Existing `app.*.tsx` files move under the `_authenticated` layout.

## Delivery order
I'll ship in the phases above so the app is usable after each phase. Phase 1 lands first (you can sign up + log in). Say "go" and I'll start.