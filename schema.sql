-- Rode este arquivo inteiro em: Supabase > SQL Editor > New query > Run
create extension if not exists btree_gist;

create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  telegram_chat_id text,                         -- chat_id do barbeiro no Telegram
  user_id uuid unique references auth.users on delete set null,  -- login do barbeiro
  active boolean not null default true
);
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_min int not null default 30 check (duration_min > 0),
  price numeric(8,2) not null,
  active boolean not null default true
);
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers,
  service_id uuid not null references public.services,
  customer_name text not null,
  customer_phone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmado' check (status in ('confirmado','cancelado','concluido')),
  created_at timestamptz not null default now(),
  -- impede dois agendamentos sobrepostos para o mesmo barbeiro
  exclude using gist (barber_id with =, tstzrange(starts_at, ends_at) with &&) where (status <> 'cancelado')
);

alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;

create policy "público vê barbeiros ativos" on public.barbers for select using (active);
create policy "público vê serviços ativos" on public.services for select using (active);
-- o telegram_chat_id não deve ser público: o site só lê id e name
revoke select on public.barbers from anon;
grant select (id, name, active) on public.barbers to anon;

create policy "barbeiro vê a própria agenda" on public.appointments for select to authenticated
  using (barber_id in (select id from public.barbers where user_id = auth.uid()));
create policy "barbeiro atualiza a própria agenda" on public.appointments for update to authenticated
  using (barber_id in (select id from public.barbers where user_id = auth.uid()))
  with check (barber_id in (select id from public.barbers where user_id = auth.uid()));
create policy "barbeiro vê a si mesmo" on public.barbers for select to authenticated using (user_id = auth.uid());
grant select on public.barbers to authenticated;

-- Horários ocupados (sem expor dados dos clientes)
create or replace function public.get_busy(p_barber uuid, p_day date)
returns table(starts_at timestamptz, ends_at timestamptz)
language sql security definer set search_path = public as $$
  select a.starts_at, a.ends_at from appointments a
  where a.barber_id = p_barber and a.status <> 'cancelado'
    and a.starts_at >= (p_day::timestamp at time zone 'America/Sao_Paulo')
    and a.starts_at <  ((p_day + 1)::timestamp at time zone 'America/Sao_Paulo');
$$;

-- Criar agendamento (única forma de o público inserir)
create or replace function public.book_appointment(p_barber uuid, p_service uuid, p_name text, p_phone text, p_start timestamptz)
returns uuid language plpgsql security definer set search_path = public as $$
declare dur int; new_id uuid;
begin
  if p_start <= now() then raise exception 'horário no passado'; end if;
  if length(trim(p_name)) < 2 or length(regexp_replace(p_phone, '\D', '', 'g')) < 10 then raise exception 'dados inválidos'; end if;
  select duration_min into dur from services where id = p_service and active;
  if dur is null then raise exception 'serviço inválido'; end if;
  if not exists (select 1 from barbers where id = p_barber and active) then raise exception 'barbeiro inválido'; end if;
  insert into appointments(barber_id, service_id, customer_name, customer_phone, starts_at, ends_at)
  values (p_barber, p_service, trim(p_name), trim(p_phone), p_start, p_start + make_interval(mins => dur))
  returning id into new_id;
  return new_id;
end $$;
grant execute on function public.get_busy(uuid, date) to anon, authenticated;
grant execute on function public.book_appointment(uuid, uuid, text, text, timestamptz) to anon, authenticated;

create or replace function public.get_busy_all(p_day date)
returns table(barber_id uuid, starts_at timestamptz, ends_at timestamptz)
language sql security definer set search_path = public as $$
  select a.barber_id, a.starts_at, a.ends_at from appointments a
  where a.status <> 'cancelado'
    and a.starts_at >= (p_day::timestamp at time zone 'America/Sao_Paulo')
    and a.starts_at <  ((p_day + 1)::timestamp at time zone 'America/Sao_Paulo');
$$;
grant execute on function public.get_busy_all(date) to anon, authenticated;

alter publication supabase_realtime add table public.appointments;

-- Exemplos (edite à vontade)
insert into public.services(name, duration_min, price) values
  ('Corte', 40, 40), ('Barba', 30, 30), ('Corte + Barba', 50, 65);
insert into public.barbers(name) values ('Barbeiro 1'), ('Barbeiro 2'), ('Barbeiro 3');
