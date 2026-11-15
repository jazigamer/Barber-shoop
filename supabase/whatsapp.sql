-- Rode no SQL Editor para ativar o aviso por WhatsApp (CallMeBot, gratuito)
alter table public.barbers add column if not exists whatsapp_phone text;   -- ex: 5511999998888 (só números, com 55)
alter table public.barbers add column if not exists whatsapp_apikey text;  -- chave que o CallMeBot manda para cada barbeiro
-- garante que o site público continua lendo só id, name e active
revoke select on public.barbers from anon;
grant select (id, name, active) on public.barbers to anon;
