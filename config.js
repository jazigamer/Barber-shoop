// Cole aqui os dados do seu projeto: Supabase > Project Settings > API
// A chave "anon public" pode ficar no site (a segurança vem das regras RLS do schema.sql).
window.CONFIG = {
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY: "SUA-CHAVE-ANON-PUBLICA",
  NOME: "Barber Shop",
  ABRE: "09:00",       // primeiro horário
  FECHA: "19:00",      // fim do expediente
  PASSO_MIN: 30,       // intervalo entre horários (pode usar 10, 15 ou 20)
  DIAS_FRENTE: 30,     // quantos dias à frente o cliente pode agendar
  DIAS_FECHADOS: [0],  // 0 = domingo
  ENDERECO: "Rua Exemplo, 123 - Centro",
  TELEFONE: "(11) 98765-4321",
  INSTAGRAM: "@thebarber"
};
