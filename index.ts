// Chamada pelo site logo depois de um agendamento (e também aceita Database Webhook).
// Avisa o barbeiro no Telegram e/ou WhatsApp (CallMeBot). Evita avisos duplicados.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const resp = (t: string, status = 200) => new Response(t, { status, headers: cors });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return resp("ok");
  const body = await req.json().catch(() => ({}));
  const id = body.appointment_id ?? body.record?.id;
  if (!id) return resp("sem id", 400);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // "reserva" o aviso: só avisa agendamentos recentes e ainda não avisados
  const { data: a } = await sb.from("appointments")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", id).is("notified_at", null)
    .gt("created_at", new Date(Date.now() - 10 * 60000).toISOString())
    .select("*").maybeSingle();
  if (!a) return resp("nada a enviar");

  const { data: b } = await sb.from("barbers").select("*").eq("id", a.barber_id).single();
  const { data: s } = await sb.from("services").select("name").eq("id", a.service_id).single();
  const liberar = () => sb.from("appointments").update({ notified_at: null }).eq("id", id);
  if (!b) { console.error("barbeiro não encontrado"); await liberar(); return resp("barbeiro não encontrado", 500); }

  const quando = new Date(a.starts_at).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit",
  });
  const text = `Novo agendamento!\n\nBarbeiro: ${b.name}\nCliente: ${a.customer_name}\nWhatsApp: ${a.customer_phone}\nServiço: ${s?.name ?? ""}\nHorário: ${quando}`;
  const res: string[] = []; let falhou = false;

  if (b.telegram_chat_id) {
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!token) { console.error("falta o secret TELEGRAM_BOT_TOKEN"); falhou = true; res.push("telegram:sem token"); }
    else {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: b.telegram_chat_id, text }),
      }).catch((e) => { console.error(e); return null; });
      if (!r?.ok) { console.error("telegram falhou:", r ? await r.text() : "sem resposta"); falhou = true; }
      res.push(`telegram:${r?.ok ? "ok" : "erro"}`);
    }
  } else console.error("barbeiro sem telegram_chat_id:", b.name);

  if (b.whatsapp_phone && b.whatsapp_apikey) {
    const r = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(b.whatsapp_phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(b.whatsapp_apikey)}`).catch(() => null);
    res.push(`whatsapp:${r?.ok ? "ok" : "erro"}`);
  }
  if (falhou) await liberar();
  return resp(res.join(" ") || "nenhum canal configurado");
});
