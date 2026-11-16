-- ============================================================
-- ATUALIZAÇÃO V3 — cole TUDO no Supabase > SQL Editor > Run
-- Pode rodar mais de uma vez sem problema.
-- ATENÇÃO: apaga os agendamentos de TESTE e recria barbeiros e serviços.
-- ============================================================

-- 1) Colunas novas
alter table public.barbers add column if not exists ordem int not null default 0;
alter table public.barbers add column if not exists whatsapp_phone text;
alter table public.barbers add column if not exists whatsapp_apikey text;
alter table public.appointments add column if not exists notified_at timestamptz;

-- 2) Barbeiros e serviços reais
delete from public.appointments;
delete from public.barbers;
delete from public.services;
insert into public.barbers(name, ordem) values ('Gustavo', 1), ('Dudu', 2), ('Breno', 3);
insert into public.services(name, duration_min, price) values
  ('Corte', 40, 25),
  ('Barba', 20, 20),            -- se a barba for R$ 15, troque 20 por 15
  ('Corte + Barba', 60, 45);

-- 3) Login do painel: o barbeiro entra com seuemail+gustavo@..., +dudu@..., +breno@...
--    e o sistema liga ao barbeiro pelo nome (Gustavo, Dudu, Breno). Não precisa preencher nada.
create or replace function public.my_barber_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.barbers
  where lower(name) = lower(coalesce(
    substring(auth.jwt() ->> 'email' from '\+([^@]+)@'),
    split_part(auth.jwt() ->> 'email', '@', 1)))
  limit 1
$$;
create or replace function public.my_barber() returns table(id uuid, name text)
language sql stable security definer set search_path = public as $$
  select id, name from public.barbers where id = public.my_barber_id()
$$;
grant execute on function public.my_barber_id(), public.my_barber() to authenticated;

drop policy if exists "barbeiro vê a própria agenda" on public.appointments;
drop policy if exists "barbeiro atualiza a própria agenda" on public.appointments;
drop policy if exists "barbeiro vê a si mesmo" on public.barbers;
create policy "barbeiro vê a própria agenda" on public.appointments
  for select to authenticated using (barber_id = public.my_barber_id());
create policy "barbeiro atualiza a própria agenda" on public.appointments
  for update to authenticated using (barber_id = public.my_barber_id()) with check (barber_id = public.my_barber_id());

-- 4) Dados privados (telegram/whatsapp) ficam fora do alcance do site
revoke select on public.barbers from anon, authenticated;
grant select (id, name, active, ordem) on public.barbers to anon, authenticated;

-- 5) Função usada pelo calendário
create or replace function public.get_busy_all(p_day date)
returns table(barber_id uuid, starts_at timestamptz, ends_at timestamptz)
language sql security definer set search_path = public as $$
  select a.barber_id, a.starts_at, a.ends_at from appointments a
  where a.status <> 'cancelado'
    and a.starts_at >= (p_day::timestamp at time zone 'America/Sao_Paulo')
    and a.starts_at <  ((p_day + 1)::timestamp at time zone 'America/Sao_Paulo');
$$;
grant execute on function public.get_busy_all(date) to anon, authenticated;
