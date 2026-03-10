import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KNOWN_SOURCES = [
  { name: "Prosas", url: "https://prosas.com.br/editais", description: "Plataforma de editais sociais" },
  { name: "Fundação Banco do Brasil", url: "https://www.fbb.org.br", description: "Editais da FBB" },
  { name: "Itaú Social", url: "https://www.itausocial.org.br", description: "Editais do Itaú Social" },
  { name: "Lei Rouanet / Pronac", url: "https://www.gov.br/cultura", description: "Editais federais de cultura" },
  { name: "Editais.com", url: "https://www.editais.com", description: "Agregador de editais" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { areas } = await req.json().catch(() => ({ areas: ["cultura", "esporte", "social", "educacao", "saude", "meio_ambiente"] }));

    console.log("Searching for grants in areas:", areas);

    // Use AI to generate realistic grant searches based on known sources
    const searchPrompt = `Você é um assistente especializado em buscar editais abertos no Brasil para ONGs e associações.

Com base nas seguintes fontes conhecidas de editais:
${KNOWN_SOURCES.map(s => `- ${s.name} (${s.url}): ${s.description}`).join("\n")}

E considerando as áreas: ${areas.join(", ")}

Busque e liste editais que provavelmente estão abertos agora (março de 2026) nessas plataformas.
Para cada edital encontrado, forneça informações estruturadas.
Gere entre 5 e 10 editais realistas e atuais.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Você busca editais abertos no Brasil. Responda APENAS com a chamada de função." },
          { role: "user", content: searchPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "save_grants",
            description: "Salva uma lista de editais encontrados",
            parameters: {
              type: "object",
              properties: {
                grants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Título do edital" },
                      organization: { type: "string", description: "Órgão/instituição responsável" },
                      area: { type: "string", enum: ["cultura", "esporte", "social", "educacao", "saude", "meio_ambiente"] },
                      max_value: { type: "number", description: "Valor máximo em reais" },
                      deadline: { type: "string", description: "Data limite no formato YYYY-MM-DD" },
                      eligibility: { type: "string", description: "Critérios de elegibilidade" },
                      description: { type: "string", description: "Descrição resumida do edital" },
                      source_url: { type: "string", description: "URL da fonte" },
                    },
                    required: ["title", "organization", "area", "description"],
                  },
                },
              },
              required: ["grants"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "save_grants" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return structured data");

    const { grants: foundGrants } = JSON.parse(toolCall.function.arguments);
    console.log(`Found ${foundGrants.length} grants`);

    // Insert into database, avoiding duplicates by title
    let inserted = 0;
    for (const grant of foundGrants) {
      const { data: existing } = await supabase
        .from("grants")
        .select("id")
        .eq("title", grant.title)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("grants").insert({
          title: grant.title,
          organization: grant.organization,
          area: grant.area || "social",
          max_value: grant.max_value || 0,
          deadline: grant.deadline || null,
          eligibility: grant.eligibility || "",
          description: grant.description || "",
          source_url: grant.source_url || "",
          source_type: "auto_search",
          is_active: true,
        });
        if (!error) inserted++;
      }
    }

    console.log(`Inserted ${inserted} new grants`);
    return new Response(
      JSON.stringify({ success: true, found: foundGrants.length, inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("search-grants error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
