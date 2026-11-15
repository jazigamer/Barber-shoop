# Sistema de agendamento da barbearia

- `index.html` → site do cliente (serviço, barbeiro, dia, horário)
- `admin.html` → painel do barbeiro (login, agenda em tempo real, concluir/cancelar)
- `supabase/schema.sql` → tabelas, regras de segurança (RLS) e funções
- `supabase/functions/notify-telegram` → aviso no Telegram a cada agendamento

> Já rodou o `schema.sql` antes? Rode também `supabase/update_v2.sql` (necessário para o novo agendamento com calendário).

## ATUALIZAÇÃO V3 (faça nesta ordem)
1. **Banco:** SQL Editor → cole `supabase/update_v3.sql` inteiro → Run. (Cria Gustavo, Dudu e Breno, os serviços e as regras do painel. Apaga os agendamentos de teste.)
2. **Painel dos barbeiros:** Authentication → Users → *Add user → Create new user*, marcando *Auto Confirm User*, três vezes, com o SEU e-mail e um `+nome`:
   `seuemail+gustavo@gmail.com`, `seuemail+dudu@gmail.com`, `seuemail+breno@gmail.com` (cada um com a senha que quiser, mínimo 6 caracteres).
   Depois, **desative o cadastro aberto** (Authentication → Sign In / Providers → "Allow new users to sign up" desligado).
   No `config.js`, troque `SEUEMAIL@gmail.com` pelo seu e-mail. Em `/admin.html` o login é só o nome: `gustavo` + a senha.
3. **Telegram (sem terminal):**
   - **Revogue o token antigo:** @BotFather → `/revoke` → escolha o bot → copie o token novo.
   - Supabase → **Edge Functions → Deploy a new function → Via Editor**. Nome: `notify-telegram`. Apague o exemplo e cole o conteúdo de `supabase/functions/notify-telegram/index.ts`. Deploy.
   - Nas configurações da função, **desligue "Verify JWT"**.
   - Edge Functions → **Secrets** → adicione `TELEGRAM_BOT_TOKEN` = o token novo.
   - **chat_id:** o jeito mais fácil é um grupo "Agenda" com os 3 barbeiros + o bot. Mande uma mensagem no grupo e abra `https://api.telegram.org/botSEU_TOKEN/getUpdates` no navegador; copie o `chat` → `id` (número negativo). Em **Table Editor → barbers**, cole esse número em `telegram_chat_id` dos três.
   - Não precisa mais criar Database Webhook: o site avisa a função sozinho.
   - Não chegou? Edge Functions → notify-telegram → **Logs** mostra o motivo.

## 0. Conteúdo e fotos do site
- `site.js`: WhatsApp, Instagram, endereço, horários, texto "sobre" e fotos. É o único arquivo que você edita para personalizar o site.
- Fotos: copie as imagens para a pasta do projeto e escreva o nome em `FOTOS` (hero, sobre, serviços, galeria). Sem foto, o site usa o visual padrão; a galeria só aparece quando você coloca imagens.
- `config.js`: **cole aqui a URL e a chave anon do Supabase** (se ficarem como "SEU-PROJETO", o site não carrega serviços nem barbeiros).

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
