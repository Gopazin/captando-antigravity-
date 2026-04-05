import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvaluationRequest {
  projectId: string;
  layer: "conformidade" | "merito" | "alinhamento";
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { projectId, layer } = (await req.json()) as EvaluationRequest;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Using service role for server-side operations
    const geminiKey = Deno.env.get("GEMINI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Project and Grant data
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*, grants(*)")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      throw new Error("Projeto não encontrado.");
    }

    const domain = project.domain || "tecnologia";

    // 2. Fetch Domain-Specific Skill (Prompt)
    const { data: skill } = await supabase
      .from("evaluation_skills")
      .select("instruction")
      .eq("domain", domain)
      .eq("layer", layer)
      .single();

    // 3. Dynamic Model Routing
    // Flash for compliance (fast/cheap), Pro for merit/alignment (deep reasoning)
    const modelName = layer === "conformidade" ? "gemini-1.5-flash" : "gemini-1.5-pro";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

    // 4. Construct System and User Prompts
    let systemInstruction = `Você é a Inteligência Artificial do Captando, especialista em avaliação de projetos.\n`;
    systemInstruction += `Domínio: ${domain.toUpperCase()}\nCamada de Avaliação: ${layer.toUpperCase()}\n\n`;

    if (skill?.instruction) {
      systemInstruction += `DIRETRIZES DA SKILL:\n${skill.instruction}\n\n`;
    }

    if (project.grants?.evaluation_framework) {
      systemInstruction += `FRAMEWORK DE AVALIAÇÃO DO EDITAL:\n${JSON.stringify(
        project.grants.evaluation_framework
      )}\n\n`;
    }

    systemInstruction += `Retorne sua análise estritamente no formato JSON abaixo, sem textos adicionais:\n`;
    systemInstruction += `{ "score": (número de 0 a 10 ou null), "feedback": "parecer detalhado", "suggestions": { "campo": "detalhe da melhoria" } }`;

    const projectContext = `
Título: ${project.title}
Tipo: ${project.project_type}
Domínio: ${domain}
Maturidade: ${JSON.stringify(project.readiness_level)}
Resumo/Briefing: ${project.briefing || ""}
Objetivos: ${project.objectives || ""}
Justificativa: ${project.justification || ""}
Metodologia: ${project.methodology || ""}
    `;

    // 5. Call Gemini API
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemInstruction },
              { text: `CONTEXTO DO PROJETO PARA ANÁLISE:\n${projectContext}` },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API Gemini: ${JSON.stringify(errorData)}`);
    }

    const geminiData = await response.json();
    const aiText = geminiData.candidates[0].content.parts[0].text;
    const aiResult = JSON.parse(aiText);

    // 6. Persist Evaluation Result
    const { error: insertError } = await supabase.from("project_evaluations").insert({
      project_id: projectId,
      layer: layer,
      domain_context: domain,
      score: aiResult.score,
      feedback: aiResult.feedback,
      suggestions: aiResult.suggestions,
    });

    if (insertError) {
      console.error("Erro ao salvar avaliação:", insertError);
    }

    return new Response(JSON.stringify(aiResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro na função evaluate-project:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
