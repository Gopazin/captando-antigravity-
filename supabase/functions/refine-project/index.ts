import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callLLM } from "../_shared/llm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages, currentProject } = await req.json();

    const systemPrompt = `Você é um assistente especialista em elaboração de projetos sociais/culturais para captação de recursos no Brasil.

O usuário está refinando um projeto já gerado. Aqui está o estado atual do projeto:

**Título:** ${currentProject.title}
**Justificativa:** ${currentProject.justification}
**Objetivos:** ${currentProject.objectives}
**Metodologia:** ${currentProject.methodology}

Quando o usuário pedir alterações:
1. Explique brevemente o que você vai alterar
2. Use a função update_project_sections para retornar as seções atualizadas

Se a alteração afetar apenas uma seção, retorne apenas aquela seção modificada. Se não, retorne todas as seções afetadas.
Mantenha o tom formal e técnico. Sempre melhore a qualidade do texto.`;

    let data;
    try {
      data = await callLLM(
        systemPrompt,
        messages,
        [
          {
            type: "function",
            function: {
              name: "update_project_sections",
              description: "Retorna as seções do projeto que foram atualizadas.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Título atualizado (omitir se não mudou)" },
                  justification: { type: "string", description: "Justificativa atualizada (omitir se não mudou)" },
                  objectives: { type: "string", description: "Objetivos atualizados (omitir se não mudou)" },
                  methodology: { type: "string", description: "Metodologia atualizada (omitir se não mudou)" },
                  explanation: { type: "string", description: "Breve explicação do que foi alterado" },
                },
                required: ["explanation"],
                additionalProperties: false,
              },
            },
          },
        ]
      );
    } catch (llmErr: any) {
      const status = llmErr.message?.includes("429") ? 429 : 500;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Erro ao refinar projeto. " + String(llmErr) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const message = data.choices?.[0]?.message;

    // Check if there's a tool call with updates
    const toolCall = message?.tool_calls?.[0];
    if (toolCall) {
      const updates = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ type: "update", ...updates }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Otherwise return text response
    return new Response(
      JSON.stringify({ type: "text", explanation: message?.content || "Entendido!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("refine-project error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
