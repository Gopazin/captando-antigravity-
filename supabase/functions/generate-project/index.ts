import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { organization, grant, briefing, documentBase64, documentName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const hasDocument = !!documentBase64;

    const systemPrompt = `Você é um especialista em elaboração de projetos para captação de recursos no Brasil.
Seu trabalho é gerar projetos estruturados e profissionais com base nos dados da organização, no edital alvo e na ideia do usuário.

${hasDocument ? `IMPORTANTE: O usuário enviou um documento PDF como base/referência ("${documentName || 'documento.pdf'}"). Você DEVE usar esse documento como a principal referência e fundação para construir o projeto. Analise profundamente o conteúdo do documento e:
- Siga a estrutura e requisitos indicados no documento
- Utilize dados, critérios e diretrizes que o documento apresenta
- Alinhe o projeto às exigências específicas do documento
- Incorpore terminologias e padrões que o documento utiliza
O documento enviado é a BASE PRINCIPAL do projeto. O briefing do usuário complementa.` : ''}

REGRAS:
- Escreva em português brasileiro formal e técnico
- Use dados concretos e referências quando possível
- Alinhe o projeto aos critérios do edital
- Destaque a capacidade técnica da organização
- Seja específico em metas, prazos e indicadores

Você DEVE responder EXCLUSIVAMENTE com uma chamada à função generate_project. Não escreva texto fora da função.`;

    const userPrompt = `## Dados da Organização (Cofre)
- Nome: ${organization.name}
- CNPJ: ${organization.cnpj}
- Localização: ${organization.location}
- Missão: ${organization.mission}
- Visão: ${organization.vision}
- Projetos anteriores: ${organization.previousProjects?.map((p: any) => `${p.title} (${p.year}, ${p.value})`).join("; ") || "Nenhum informado"}
- Equipe: ${organization.teamMembers?.map((m: any) => `${m.name} - ${m.role}`).join("; ") || "Não informada"}

## Edital Alvo
- Título: ${grant.title}
- Organização: ${grant.organization}
- Área: ${grant.area}
- Valor máximo: R$ ${(grant.maxValue || grant.max_value || 0).toLocaleString("pt-BR")}
- Prazo: ${grant.deadline}
- Elegibilidade: ${grant.eligibility}
- Descrição: ${grant.description}

## Ideia do Usuário (Briefing)
${briefing}

${hasDocument ? `\n## Documento Base Enviado
O documento PDF "${documentName}" foi anexado acima. Use-o como a BASE PRINCIPAL para construir o projeto, seguindo sua estrutura, requisitos e diretrizes.` : ''}

Gere um projeto completo e estruturado combinando esses elementos.`;

    // Build messages array
    const userContent: any[] = [];

    // If document is provided, add it as a file part for Gemini
    if (hasDocument) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:application/pdf;base64,${documentBase64}`,
        },
      });
    }

    userContent.push({
      type: "text",
      text: userPrompt,
    });

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_project",
                description:
                  "Gera um projeto estruturado com título, justificativa, objetivos e metodologia.",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "Título criativo e descritivo do projeto",
                    },
                    justification: {
                      type: "string",
                      description:
                        "Justificativa técnica com dados, referências e alinhamento ao edital (mínimo 3 parágrafos)",
                    },
                    objectives: {
                      type: "string",
                      description:
                        "Objetivo geral e pelo menos 5 objetivos específicos, formatados com quebras de linha",
                    },
                    methodology: {
                      type: "string",
                      description:
                        "Metodologia detalhada em fases com cronograma, formatada com quebras de linha",
                    },
                  },
                  required: [
                    "title",
                    "justification",
                    "objectives",
                    "methodology",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_project" },
          },
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar projeto. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "A IA não retornou o projeto estruturado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const project = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(project), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-project error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
