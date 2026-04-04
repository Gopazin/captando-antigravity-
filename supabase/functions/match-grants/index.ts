import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callLLM } from "../_shared/llm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { project, organization } = await req.json();
    
    if (!project?.title && !organization?.name) {
       return new Response(JSON.stringify({ error: "Missing project or organization data" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Matching grants for: ${project?.title || organization?.name}`);

    // Fetch active grants
    const { data: activeGrants, error } = await supabase
      .from("grants")
      .select("id, title, organization, area, max_value, eligibility, description, source_url, deadline")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    
    if (!activeGrants || activeGrants.length === 0) {
        return new Response(JSON.stringify({ matches: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `Você é um Analista de Captação de Recursos especialista em ONGs.
Sua missão é analisar o perfil de uma organização (ou projeto) e compará-lo com uma lista de editais ativos.
Retorne os 3 editais que possuem a maior compatibilidade.
Responda APENAS com a chamada de função, fornecendo os detalhes dos matches.`;

    const userPrompt = `Perfil Base para Busca:
${project?.title ? `- Título do Projeto: ${project.title}` : ""}
${project?.area ? `- Área do Projeto: ${project.area}` : ""}
${project?.objectives ? `- Objetivos: ${project.objectives}` : ""}
${organization?.name ? `- Organização: ${organization.name}` : ""}
${organization?.mission ? `- Missão: ${organization.mission}` : ""}
${organization?.interested_areas ? `- Áreas de Interesse: ${organization.interested_areas.join(', ')}` : ""}

Editais Disponíveis:
${activeGrants.map(g => `[ID: ${g.id}] ${g.title} (${g.organization}) | Área: ${g.area} | Max Estimado: ${g.max_value} | Prazo: ${g.deadline}
Desc: ${g.description}
Elegibilidade: ${g.eligibility}`).join("\n\n")}

Analise e retorne os 3 melhores matches para o perfil acima.`;

    const tools = [{
      type: "function",
      function: {
        name: "return_matches",
        description: "Retorna a lista de editais compatíveis com suas justificativas",
        parameters: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  grant_id: { type: "string" },
                  match_percentage: { type: "number", description: "Percentual de compatibilidade (0-100)" },
                  reason: { type: "string", description: "Por que este edital é um bom match?" },
                  missing_requirements: { type: "string", description: "O que falta no projeto para adequar-se?" }
                },
                required: ["grant_id", "match_percentage", "reason", "missing_requirements"]
              }
            }
          },
          required: ["matches"]
        }
      }
    }];

    const toolChoice = { type: "function", function: { name: "return_matches" } };

    const data = await callLLM(systemPrompt, userPrompt, tools, toolChoice);

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return structured data");

    const result = JSON.parse(toolCall.function.arguments);
    
    // Map with grant data
    const enrichedMatches = result.matches.map((match: any) => {
        const grant = activeGrants.find(g => g.id === match.grant_id);
        return {
            ...match,
            grant
        };
    }).filter((m: any) => m.grant !== undefined);

    return new Response(JSON.stringify({ matches: enrichedMatches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("match-grants error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
