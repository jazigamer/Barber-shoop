// Edge Function chamada por um Database Webhook a cada novo agendamento.
// Avisa o barbeiro no Telegram e/ou no WhatsApp (CallMeBot), conforme o que estiver preenchido.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

Deno.serve(async (req) => {
  const { type, record } = await req.json();
  if (type !== "INSERT" || !record) return new Response("ignorado");

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: b } = await sb.from("barbers")
    .select("name, telegram_chat_id, whatsapp_phone, whatsapp_apikey").eq("id", record.barber_id).single();
  const { data: s } = await sb.from("services").select("name").eq("id", record.service_id).single();
  if (!b) return new Response("barbeiro não encontrado");

  const quando = new Date(record.starts_at).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit",
  });
  const text = `✂️ Novo agendamento!\n\n👤 ${record.customer_name}\n📱 ${record.customer_phone}\n💈 ${s?.name ?? ""}\n🕒 ${quando}`;
  const resultados: string[] = [];

  if (b.telegram_chat_id) {
    const r = await fetch(`https://api.telegram.org/bot${Deno.env.get("TELEGRAM_BOT_TOKEN")}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: b.telegram_chat_id, text }),
    }).catch(() => null);
    resultados.push(`telegram:${r?.ok ? "ok" : "erro"}`);
  }

  if (b.whatsapp_phone && b.whatsapp_apikey) {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(b.whatsapp_phone)}` +
      `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(b.whatsapp_apikey)}`;
    const r = await fetch(url).catch(() => null);
    resultados.push(`whatsapp:${r?.ok ? "ok" : "erro"}`);
  }

  return new Response(resultados.join(" ") || "nenhum canal configurado");
});
