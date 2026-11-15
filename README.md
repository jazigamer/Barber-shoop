# Sistema de agendamento da barbearia

- `index.html` → site do cliente (serviço, barbeiro, dia, horário)
- `admin.html` → painel do barbeiro (login, agenda em tempo real, concluir/cancelar)
- `supabase/schema.sql` → tabelas, regras de segurança (RLS) e funções
- `supabase/functions/notify-telegram` → aviso no Telegram a cada agendamento

> Já rodou o `schema.sql` antes? Rode também `supabase/update_v2.sql` (necessário para o novo agendamento com calendário).

## 1. Supabase
1. Crie o projeto em supabase.com.
2. **SQL Editor** → cole `supabase/schema.sql` → Run. (Troque os serviços/barbeiros de exemplo depois em *Table Editor*.)
3. **Project Settings → API**: copie *Project URL* e a chave *anon public* para o `config.js`.

## 2. Login dos barbeiros
1. **Authentication → Users → Add user** (e-mail + senha), marque *Auto Confirm*. Desative o cadastro aberto em *Authentication → Providers → Email → Allow new users to sign up* (assim ninguém cria conta sozinho).
2. Copie o `User UID` do usuário e, em **Table Editor → barbers**, cole na coluna `user_id` do barbeiro correspondente.

## 3. Bot do Telegram
1. No Telegram, fale com **@BotFather** → `/newbot` → guarde o token.
2. Cada barbeiro abre o bot e manda `/start`. Para achar o `chat_id`, abra no navegador `https://api.telegram.org/bot<TOKEN>/getUpdates` e copie `message.chat.id`. Cole em `barbers.telegram_chat_id`.
3. Instale o CLI (`npm i -g supabase`), depois:
   ```
   supabase login
   supabase link --project-ref SEU-PROJECT-REF
   supabase secrets set TELEGRAM_BOT_TOKEN=SEU_TOKEN
   supabase functions deploy notify-telegram --no-verify-jwt
   ```
4. No painel: **Database → Webhooks → Create**: tabela `appointments`, evento **Insert**, tipo *Supabase Edge Functions* → `notify-telegram`.

## 3b. Sem instalar CLI (alternativa)
Em **Edge Functions → Deploy a new function**, cole o conteúdo de `index.ts`, desative *Verify JWT* e adicione o secret `TELEGRAM_BOT_TOKEN` em *Edge Functions → Secrets*.

## 3c. WhatsApp grátis (CallMeBot)
Serviço gratuito e não oficial, que manda mensagem para o WhatsApp **de cada barbeiro** (não faz grupo).
1. Rode `supabase/whatsapp.sql` no SQL Editor.
2. Cada barbeiro segue as instruções em **callmebot.com/blog/free-api-whatsapp-messages** (salvar o número do bot nos contatos e mandar a mensagem de ativação). O CallMeBot responde com uma *apikey*.
3. Em **Table Editor → barbers**, preencha `whatsapp_phone` (só números, com 55 + DDD) e `whatsapp_apikey`.
4. Reenvie a função (`supabase functions deploy notify-telegram --no-verify-jwt`). Telegram e WhatsApp funcionam juntos.

## 4. Git + Netlify
```
git init && git add . && git commit -m "barbearia"
git remote add origin SEU-REPO && git push -u origin main
```
Netlify → *Add new site → Import from Git* → escolha o repositório (sem build command, publish directory `.`).

- Site dos clientes: `https://seu-site.netlify.app/`
- Painel dos barbeiros: `https://seu-site.netlify.app/admin.html`

Horário de funcionamento, intervalo e dias fechados ficam em `config.js`. Fuso fixo: America/Sao_Paulo.
