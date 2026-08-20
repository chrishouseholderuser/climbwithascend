-- Privacy-only usage counts. Run in the Supabase SQL Editor after schema.sql.
-- Stores a random anonymous id, a first-climb time, and an optional last-answer time.
-- No email, name, IP, user-agent, or question text.

create table if not exists public.anon_activity (
  anon_id uuid primary key,
  first_climb_at timestamptz not null default now(),
  last_active_at timestamptz
);

alter table public.anon_activity enable row level security;

-- No direct table access from the browser. Writes and reads go through RPCs.
revoke all on public.anon_activity from public, anon, authenticated;

create or replace function public.record_usage(p_anon uuid, p_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_anon is null then
    return;
  end if;
  if p_kind is null or p_kind not in ('start', 'answer') then
    return;
  end if;

  insert into public.anon_activity (anon_id, first_climb_at, last_active_at)
  values (
    p_anon,
    now(),
    case when p_kind = 'answer' then now() else null end
  )
  on conflict (anon_id) do update
    set last_active_at = case
      when p_kind = 'answer' then now()
      else public.anon_activity.last_active_at
    end;
end;
$$;

create or replace function public.usage_counts()
returns table(tried bigint, wau bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    count(*)::bigint as tried,
    count(*) filter (
      where last_active_at is not null
        and last_active_at >= now() - interval '7 days'
    )::bigint as wau
  from public.anon_activity;
$$;

grant execute on function public.record_usage(uuid, text) to anon, authenticated;
grant execute on function public.usage_counts() to anon, authenticated;
