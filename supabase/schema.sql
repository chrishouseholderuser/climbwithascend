-- Run in Supabase SQL Editor. This is deliberately the only application table:
-- each authenticated student owns one JSON progress record.
create table if not exists public.student_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.student_progress enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on public.student_progress to authenticated;

create policy "Students read only their own progress"
on public.student_progress for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Students create only their own progress"
on public.student_progress for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Students update only their own progress"
on public.student_progress for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Keep update timestamps server-side; client-provided timestamps are ignored.
create or replace function public.set_progress_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_progress_updated_at on public.student_progress;
create trigger student_progress_updated_at
before update on public.student_progress
for each row execute function public.set_progress_updated_at();
