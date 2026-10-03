/* ==========================================================================
   GENUS-VR · Verwaltung (Supabase Edge Function)

   Der einzige Weg, auf dem Inhalte geändert werden können. Die öffentliche
   API darf die Tabelle "videos" per RLS nur lesen; geschrieben wird allein
   hier, und nur gegen den richtigen Admin-Code.

   Secrets, die gesetzt sein müssen (Dashboard → Edge Functions → Secrets):
     ADMIN_CODE                 der selbstgewählte Code
     SUPABASE_URL               wird von Supabase automatisch gestellt
     SUPABASE_SERVICE_ROLE_KEY  wird von Supabase automatisch gestellt

   "Verify JWT" muss für diese Funktion ausgeschaltet sein — die Prüfung
   übernimmt der Admin-Code.
   ========================================================================== */

import { createClient } from "jsr:@supabase/supabase-js@2";

const BUCKET = "videos";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function antwort(daten: unknown, status = 200) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

/* Dateinamen auf ein unverfängliches Muster reduzieren: der Name wandert in
   einen Speicherpfad, Umlaute und Leerzeichen machen dort nur Ärger. */
function sichererName(roh: string) {
  const sauber = roh
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);
  return sauber || "video.mp4";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return antwort({ fehler: "Nur POST." }, 405);

  let anfrage: Record<string, any>;
  try {
    anfrage = await req.json();
  } catch {
    return antwort({ fehler: "Ungültige Anfrage." }, 400);
  }

  const erwartet = Deno.env.get("ADMIN_CODE");
  if (!erwartet) {
    return antwort({ fehler: "ADMIN_CODE ist auf dem Server nicht gesetzt." }, 500);
  }
  if (anfrage.code !== erwartet) {
    /* Bremst das Durchprobieren von Codes spürbar aus. */
    await new Promise((r) => setTimeout(r, 700));
    return antwort({ fehler: "Falscher Code." }, 401);
  }

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const basis = Deno.env.get("SUPABASE_URL")!;

  switch (anfrage.aktion) {
    /* ---- Code prüfen, sonst nichts ---- */
    case "pruefen":
      return antwort({ ok: true });

    /* ---- Erlaubnis zum Hochladen erteilen ----
       Die Videodatei geht direkt vom Browser in den Speicher. Sie durch
       diese Funktion zu schleusen würde an deren Grössenbegrenzung
       scheitern. */
    case "uploadUrl": {
      const pfad = `${Date.now()}-${sichererName(String(anfrage.dateiname ?? "video.mp4"))}`;
      const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(pfad);
      if (error) return antwort({ fehler: error.message }, 500);

      const hoch = data.signedUrl.startsWith("http")
        ? data.signedUrl
        : basis + "/storage/v1" + data.signedUrl;

      return antwort({
        uploadUrl: hoch,
        oeffentlicheUrl: `${basis}/storage/v1/object/public/${BUCKET}/${pfad}`,
      });
    }

    /* ---- Eintrag anlegen oder ändern ---- */
    case "speichern": {
      const v = anfrage.video ?? {};
      const zeile = {
        name: String(v.name ?? "").trim().slice(0, 80),
        stimmung: String(v.stimmung ?? "").trim().slice(0, 120),
        datei: String(v.datei ?? "").trim().slice(0, 500),
        sekunden: Math.round(Number(v.sekunden)),
        von: String(v.von ?? "#2B5470").slice(0, 9),
        bis: String(v.bis ?? "#7FA8C0").slice(0, 9),
        sortierung: Math.round(Number(v.sortierung)) || 0,
      };
      if (!zeile.name || !zeile.datei || !(zeile.sekunden > 0)) {
        return antwort({ fehler: "Name, Datei und Länge sind nötig." }, 400);
      }

      const { data, error } = await (v.id
        ? db.from("videos").update(zeile).eq("id", v.id).select().single()
        : db.from("videos").insert(zeile).select().single());

      if (error) return antwort({ fehler: error.message }, 500);
      return antwort({ video: data });
    }

    /* ---- Eintrag entfernen, Datei gleich mit ---- */
    case "loeschen": {
      const { data, error } = await db.from("videos")
        .delete().eq("id", String(anfrage.id ?? "")).select().single();
      if (error) return antwort({ fehler: error.message }, 500);

      /* Nur löschen, was auch hier im Speicher liegt — die ursprünglichen
         Videos zeigen noch auf das statische Hosting. */
      const teil = String(data?.datei ?? "").split(`/object/public/${BUCKET}/`)[1];
      if (teil) await db.storage.from(BUCKET).remove([decodeURIComponent(teil)]);

      return antwort({ ok: true });
    }
  }

  return antwort({ fehler: "Unbekannte Aktion." }, 400);
});
