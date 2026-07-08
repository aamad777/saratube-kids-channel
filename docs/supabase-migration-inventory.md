# SaraTube Supabase Migration Inventory

## Goal

Remove Supabase completely and replace it with local on-premise services.

## Current Supabase Usage

The app currently uses Supabase for:

1. Authentication
2. Database queries
3. File/media storage
4. Edge Functions for AI

## Supabase Client Files

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`

These files create and type the Supabase client.

## Authentication Usage

Files:

- `src/pages/SignInPage.tsx`
- `src/pages/SignUpPage.tsx`
- `src/pages/KidLoginPage.tsx`
- `src/contexts/AuthContext.tsx`
- `src/components/effects/ParentUnlock.tsx`

Replacement:

- Local backend auth API
- Password hashing with bcrypt
- JWT access tokens
- Parent and child login endpoints

Future local endpoints:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/kid-login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Database Usage

Files include:

- `src/pages/ParentDashboard.tsx`
- `src/pages/Index.tsx`
- `src/pages/WatchPage.tsx`
- `src/pages/ChildSelectPage.tsx`
- `src/pages/UploadPage.tsx`
- `src/components/video/VideoCard.tsx`
- `src/components/video/VideoGrid.tsx`
- `src/components/home/UnifiedMediaGrid.tsx`
- `src/components/kids/KidsPhotoFeed.tsx`
- `src/components/parent/ScreenTimeChart.tsx`
- `src/components/parent/CategoryManager.tsx`
- `src/hooks/useTimeLimitChecker.tsx`
- `src/hooks/useScreenTimeTracker.tsx`

Replacement:

- Local backend REST API
- Local PostgreSQL database

Future tables may include:

- users
- parents
- children
- profiles
- media_files
- kids_photos
- categories
- video_child_access
- activity_logs
- daily_watch_time
- screen_time_limits
- blocked_categories

## Storage Usage

Files:

- `src/pages/UploadPage.tsx`
- `src/components/kids/KidsPhotoUpload.tsx`

Replacement:

- Backend upload endpoint
- Local filesystem or Synology NAS-mounted media folder

Future local endpoints:

- `POST /api/media/upload`
- `GET /media/:filename`
- `POST /api/photos/upload`
- `GET /uploads/photos/:filename`

## AI Usage

Files:

- `src/components/ai/KidsChatBot.tsx`
- `src/components/ai/GuidedQuizBot.tsx`
- `src/components/parent/ParentAIAdvisor.tsx`

Replacement:

- Local backend AI endpoints
- Ollama local model

Future local endpoints:

- `POST /api/ai/kids-chat`
- `POST /api/ai/quiz-advisor`
- `POST /api/ai/parent-advisor`

## Migration Strategy

Do not replace everything at once.

Recommended order:

1. Build local backend skeleton
2. Add health endpoint
3. Add local AI endpoint first
4. Replace frontend AI URLs
5. Add PostgreSQL
6. Replace authentication
7. Replace database queries one page at a time
8. Replace media storage
9. Remove Supabase package and integration files
10. Remove Supabase folder and environment variables

## Notes

The frontend currently depends on Supabase directly. The target design is to make the frontend talk only to our own backend API.
