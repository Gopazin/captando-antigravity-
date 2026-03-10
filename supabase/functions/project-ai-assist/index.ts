import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { project, tasks, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "suggest_tasks") {
      systemPrompt = `Você é um gerente de projetos sociais especialista. Analise o projeto e sugira tarefas concretas e acionáveis para a fase atual. Responda APENAS com a chamada de função.`;
      userPrompt = `Projeto: ${project.title}
Status: ${project.status}
Descrição: ${project.description || project.briefing}
Justificativa: ${project.justification || "Não definida"}
Objetivos: ${project.objectives || "Não definidos"}
Metodologia: ${project.methodology || "Não definida"}
Tarefas existentes: ${tasks?.map((t: any) => `- ${t.title} (${t.status})`).join("\n") || "Nenhuma"}

Sugira 5-8 tarefas práticas e específicas para avançar este projeto na fase "${project.status}".`;
    } else if (action === "analyze_progress") {
      systemPrompt = `Você é um consultor de projetos sociais. Analise o progresso e dê recomendações estratégicas. Responda APENAS com a chamada de função.`;
      userPrompt = `Projeto: ${project.title}
Status: ${project.status}
Progresso: ${project.progress}%
Tarefas: ${tasks?.map((t: any) => `- ${t.title} (${t.status}, prioridade: ${t.priority})`).join("\n") || "Nenhuma"}

Analise o progresso e dê recomendações.`;
    } else if (action === "next_steps") {
      systemPrompt = `Você é um especialista em gestão de projetos para ONGs. Identifique os próximos passos críticos. Responda APENAS com a chamada de função.`;
      userPrompt = `Projeto: ${project.title}
Status: ${project.status}
Progresso: ${project.progress}%
Descrição: ${project.description || project.briefing}
Tarefas pendentes: ${tasks?.filter((t: any) => t.status !== "concluida").map((t: any) => `- ${t.title} (${t.priority})`).join("\n") || "Nenhuma"}

Quais são os próximos passos críticos para este projeto?`;
    }

    const tools = action === "suggest_tasks" ? [{
      type: "function",
      function: {
        name: "suggest_tasks",
        description: "Sugere tarefas para o projeto",
        parameters: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["baixa", "media", "alta", "urgente"] },
                  due_days: { type: "number", description: "Dias a partir de hoje para prazo" },
                },
                required: ["title", "description", "priority"],
              },
            },
          },
          required: ["tasks"],
        },
      },
    }] : [{
      type: "function",
      function: {
        name: "provide_analysis",
        description: "Fornece análise e recomendações",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Resumo da análise" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  priority: { type: "string", enum: ["info", "warning", "critical"] },
                },
                required: ["text", "priority"],
              },
            },
            suggested_status: { type: "string", description: "Status sugerido para o projeto se houver mudança" },
            suggested_progress: { type: "number", description: "Progresso sugerido (0-100)" },
          },
          required: ["summary", "recommendations"],
        },
      },
    }];

    const toolName = action === "suggest_tasks" ? "suggest_tasks" : "provide_analysis";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: toolName } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return structured data");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("project-ai-assist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
