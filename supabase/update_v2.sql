-- Rode no SQL Editor (só precisa se você já tinha rodado o schema.sql antes)
create or replace function public.get_busy_all(p_day date)
returns table(barber_id uuid, starts_at timestamptz, ends_at timestamptz)
language sql security definer set search_path = public as $$
  select a.barber_id, a.starts_at, a.ends_at from appointments a
  where a.status <> 'cancelado'
    and a.starts_at >= (p_day::timestamp at time zone 'America/Sao_Paulo')
    and a.starts_at <  ((p_day + 1)::timestamp at time zone 'America/Sao_Paulo');
$$;
grant execute on function public.get_busy_all(date) to anon, authenticated;

-- Durações de exemplo (30 a 50 min). Ajuste os nomes/preços conforme a sua barbearia:
update public.services set duration_min = 40 where name = 'Corte';
update public.services set duration_min = 30 where name = 'Barba';
update public.services set duration_min = 50 where name = 'Corte + Barba';
