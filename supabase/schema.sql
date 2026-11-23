-- Supabase panelinde: SQL Editor → New query → bu dosyayı yapıştır → Run

create table if not exists public.tasks (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title       text not null check (char_length(title) between 1 and 200),
  priority    text not null default 'orta' check (priority in ('dusuk', 'orta', 'yuksek')),
  is_done     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);

-- Row Level Security: her kullanıcı yalnızca kendi görevlerini görür/değiştirir
alter table public.tasks enable row level security;

create policy "Kullanici kendi gorevlerini okur"
  on public.tasks for select using (auth.uid() = user_id);

create policy "Kullanici kendine gorev ekler"
  on public.tasks for insert with check (auth.uid() = user_id);

create policy "Kullanici kendi gorevini gunceller"
  on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Kullanici kendi gorevini siler"
  on public.tasks for delete using (auth.uid() = user_id);
