import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callLLM } from "../_shared/llm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Formats date to YYYYMMDD
const formatDateForPNCP = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
};

const mapPncpToGrant = (item: any) => {
  const objText = (item.objetoCompra || item.objetoContratacao || "").toLowerCase();
  const descText = (item.descricao || "").toLowerCase();
  const orgText = (item.orgaoEntidade?.razaoSocial || "").toLowerCase();
  
  const fullText = `${objText} ${descText} ${orgText}`;
  
  const isCultura = fullText.includes("cultura") || fullText.includes("arte") || fullText.includes("musica") || fullText.includes("m\u00fasica") || fullText.includes("audiovisual");
  const isEsporte = fullText.includes("esporte") || fullText.includes("lazer");
  const isSaude = fullText.includes("saude") || fullText.includes("sa\u00fade") || fullText.includes("hospitalar") || fullText.includes("m\u00e9dic");
  const isEducacao = fullText.includes("educacao") || fullText.includes("educa\u00e7\u00e3o") || fullText.includes("escola") || fullText.includes("ensino");
  const isMeioAmbiente = fullText.includes("ambiente") || fullText.includes("ecologia") || fullText.includes("sustentavel") || fullText.includes("sustent\u00e1vel");
  
  let area = "social";
  if (isCultura) area = "cultura";
  else if (isEsporte) area = "esporte";
  else if (isSaude) area = "saude";
  else if (isEducacao) area = "educacao";
  else if (isMeioAmbiente) area = "meio_ambiente";

  // PNCP uses dataEncerramentoProposta for the closing date
  const deadlineStr = item.dataEncerramentoProposta || item.dataFimVigencia || item.dataAberturaPropostas || null;
  const deadline = deadlineStr ? deadlineStr.split("T")[0] : null;

  if (deadline) {
    const dDate = new Date(deadline);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (dDate < today) return null;
  }

  return {
    title: item.objetoCompra || item.objetoContratacao || "Edital PNCP",
    organization: item.orgaoEntidade?.razaoSocial || "\u00d3rg\u00e3o P\u00fablico",
    area: area,
    max_value: item.valorTotalEstimado || 0,
    deadline: deadline,
    eligibility: "Consultar PNCP / ONGs e OSCs",
    description: (item.descricao || item.objetoCompra || item.objetoContratacao || "").substring(0, 1000),
    source_url: item.linkSistemaOrigem || `https://pncp.gov.br/app/editais/${item.orgaoEntidade?.cnpj}/${item.anoCompra}/${item.numeroCompra}`,
    source_type: "pncp_api",
    is_active: true,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { areas } = await req.json().catch(() => ({ areas: ["social"] }));
    console.log("Searching for grants in areas:", areas);

    let foundGrants: any[] = [];
    
    // 1. PNCP API Search - BROAD SEARCH
    const modalities = [10, 8, 6, 4]; // Chamamento, Dispensa, Inexigibilidade, Concorrência
    for (const modality of modalities) {
      try {
        const today = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90); 
        const dataInicial = formatDateForPNCP(ninetyDaysAgo);
        const dataFinal = formatDateForPNCP(today);

        const pncpUrl = `https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=${dataInicial}&dataFinal=${dataFinal}&codigoModalidadeContratacao=${modality}&pagina=1&tamanhoPagina=100`;
        
        const pncpRes = await fetch(pncpUrl);
        if (pncpRes.ok) {
          const pncpData = await pncpRes.json();
          if (pncpData.data && Array.isArray(pncpData.data)) {
            let relevant;
            if (modality === 10) {
              relevant = pncpData.data;
            } else {
              relevant = pncpData.data.filter((d: any) => {
                const full = `${d.objetoCompra} ${d.descricao} ${d.objetoContratacao}`.toLowerCase();
                return full.includes("fomento") || full.includes("chamamento") || full.includes("social") || 
                       full.includes("osc") || full.includes("ong") || full.includes("parceria") || 
                       full.includes("cultura") || full.includes("esporte") || full.includes("saude") ||
                       full.includes("educa\u00e7\u00e3o") || full.includes("meio ambiente");
              });
            }
            const mapped = relevant.map(mapPncpToGrant).filter(Boolean);
            console.log(`PNCP Modality ${modality}: Found ${mapped.length} items`);
            foundGrants = [...foundGrants, ...mapped];
          }
        }
      } catch (err) { console.error(`PNCP Error Modality ${modality}:`, err); }
    }

    // 2. Multi-Portal Web Search (Serper.dev)
    const SERPER_API_KEY = Deno.env.get("SERPER_API_KEY");
    if (SERPER_API_KEY) {
      const queries = [
        `editais abertos fomento ${areas[0] || "projetos sociais"} Brasil 2026`,
        `parceria Transferegov programas abertos OSC 2026`,
        `edital "Ita\u00fa Social" aberto 2026`,
        `edital "Funda\u00e7\u00e3o BB" 2026`,
        `editais ONGs "BrazilFoundation" abertos`,
        `chamamento p\u00fablico MROSC estadual aberto 2026`,
        `edital "Instituto C&A" moda sustent\u00e1vel`,
        `editais de fomento cultura estaduais abertos 2026`
      ];

      for (const q of queries) {
        try {
          const serperRes = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ q: q, gl: "br", hl: "pt-br", num: 15 })
          });
          if (serperRes.ok) {
            const serperData = await serperRes.json();
            if (serperData.organic) {
              console.log(`Serper query "${q}": Found ${serperData.organic.length} results`);
              const searchResults = serperData.organic.map((r: any) => ({
                title: r.title,
                organization: r.title.split("-")[0].trim().substring(0, 50) || "Fonte Web",
                area: areas[0] || "social",
                max_value: 0, deadline: null, eligibility: "Verificar no link",
                description: r.snippet || "", source_url: r.link, source_type: "google_search", is_active: true
              }));
              foundGrants = [...foundGrants, ...searchResults];
            }
          }
        } catch (err) { console.error("Serper Error:", err); }
      }
    }

    // 3. Fallback AI Generation
    if (foundGrants.length < 10) {
      console.log("Fallback AI. Current items: " + foundGrants.length);
      const searchPrompt = `Gere 12 exemplos de editais REAIS ou extremamente realistas abertos para ONGs/OSCs no Brasil em 2026 nas \u00e1reas: ${areas.join(", ")}. Inclua Transferegov, Funda\u00e7\u00f5es e Portais Estaduais.`;
      const tools = [{ type: "function", function: { name: "save_grants", parameters: { type: "object", properties: { grants: { type: "array", items: { type: "object", properties: { title: { type: "string" }, organization: { type: "string" }, area: { type: "string" }, max_value: { type: "number" }, deadline: { type: "string" }, description: { type: "string" }, source_url: { type: "string" } }, required: ["title", "organization", "description"] } } }, required: ["grants"] } } }];
      try {
        const aiData = await callLLM("Voc\u00ea \u00e9 um radar de editais de fomento no Brasil.", searchPrompt, tools, { type: "function", function: { name: "save_grants" } });
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const parsed = JSON.parse(toolCall.function.arguments).grants;
          foundGrants = [...foundGrants, ...parsed.map((g: any) => ({ ...g, source_type: "ai_fallback", is_active: true }))];
        }
      } catch (err) { console.error("AI Fallback Error:", err); }
    }

    let inserted = 0;
    let skipped = 0;
    for (const grant of foundGrants) {
      if (!grant.title) continue;
      
      let isDuplicate = false;
      if (grant.source_url) {
        const { data: exUrl } = await supabase.from("grants").select("id").eq("source_url", grant.source_url).maybeSingle();
        if (exUrl) isDuplicate = true;
      }
      if (!isDuplicate) {
        const { data: exTitle } = await supabase.from("grants").select("id").eq("title", grant.title).eq("organization", grant.organization).maybeSingle();
        if (exTitle) isDuplicate = true;
      }

      if (!isDuplicate) {
        const { error } = await supabase.from("grants").insert({
          title: grant.title, organization: grant.organization, area: grant.area || "social",
          max_value: grant.max_value || 0, deadline: grant.deadline || null,
          eligibility: grant.eligibility || "", description: grant.description || "",
          source_url: grant.source_url || "", source_type: grant.source_type || "auto_search", is_active: true,
        });
        if (!error) inserted++;
        else console.error("DB Insert Error:", error);
      } else { skipped++; }
    }

    console.log(`Finalized: ${inserted} inserted, ${skipped} skipped duplicates.`);
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
