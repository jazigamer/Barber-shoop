// Cole aqui os dados do seu projeto: Supabase > Project Settings > API
// A chave "anon/publishable" pode ficar no site (a segurança vem das regras RLS do banco).
window.CONFIG = {
  SUPABASE_URL: "https://ejuzlrhnrismxyskmphm.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_4XHOLP2pvNJ3QFPH6msBww_ckaZec0n",
  NOME: "Barber Shop",
  ABRE: "08:00",       // primeiro horário
  FECHA: "19:00",      // fim do expediente
  PASSO_MIN: 20,       // intervalo entre horários (20 encaixa certinho: barba 20, corte 40, combo 60)
  DIAS_FRENTE: 30,     // quantos dias à frente o cliente pode agendar
  DIAS_FECHADOS: [0],  // 0 = domingo
  ENDERECO: "Rua Exemplo, 123 - Centro",
  TELEFONE: "(11) 98765-4321",
  INSTAGRAM: "@barber._shoop_",
  // Painel dos barbeiros: login só com o nome (gustavo, dudu, breno).
  // Coloque aqui o SEU e-mail; o sistema usa seuemail+gustavo@..., seuemail+dudu@... etc.
  ADMIN_EMAIL_BASE: "SEUEMAIL@gmail.com"
};
