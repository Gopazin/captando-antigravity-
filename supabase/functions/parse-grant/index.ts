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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { url, pdfText, manualData } = await req.json();

    let contentToAnalyze = "";
    let sourceType = "manual";
    let sourceUrl = "";

    if (manualData) {
      // Direct manual entry - save without AI
      const { error } = await supabase.from("grants").insert({
        title: manualData.title,
        organization: manualData.organization,
        area: manualData.area || "social",
        max_value: manualData.max_value || 0,
        deadline: manualData.deadline || null,
        eligibility: manualData.eligibility || "",
        description: manualData.description || "",
        source_url: manualData.source_url || "",
        source_type: "manual",
        is_active: true,
      });
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: "Edital salvo com sucesso" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (url) {
      sourceType = "url";
      sourceUrl = url;
      try {
        const pageResponse = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ProjetoFacil/1.0)" },
        });
        contentToAnalyze = await pageResponse.text();
        // Trim HTML to reasonable size
        contentToAnalyze = contentToAnalyze.substring(0, 30000);
      } catch (fetchErr) {
        console.error("Failed to fetch URL:", fetchErr);
        contentToAnalyze = `URL fornecida: ${url} (não foi possível acessar o conteúdo diretamente)`;
      }
    } else if (pdfText) {
      sourceType = "pdf";
      contentToAnalyze = pdfText.substring(0, 30000);
    } else {
      throw new Error("Forneça uma URL, texto de PDF ou dados manuais");
    }

    // Use AI to extract structured grant data
    let data;
    try {
      data = await callLLM(
        "Você é um especialista em extrair informações de editais brasileiros. Analise o conteúdo e extraia os dados estruturados. Responda APENAS com a chamada de função.",
        `Analise o seguinte conteúdo de edital e extraia as informações estruturadas:\n\n${contentToAnalyze}`,
        [{
          type: "function",
          function: {
            name: "extract_grant",
            description: "Extrai dados estruturados de um edital",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                organization: { type: "string" },
                area: { type: "string", enum: ["cultura", "esporte", "social", "educacao", "saude", "meio_ambiente"] },
                max_value: { type: "number" },
                deadline: { type: "string", description: "YYYY-MM-DD" },
                eligibility: { type: "string" },
                description: { type: "string" },
              },
              required: ["title", "organization", "area", "description"],
            },
          },
        }],
        { type: "function", function: { name: "extract_grant" } }
      );
    } catch (err) {
      console.error("AI error:", err);
      throw new Error("Erro ao processar edital com IA: " + String(err));
    }

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou dados estruturados");

    const grant = JSON.parse(toolCall.function.arguments);

    const { error: insertError, data: inserted } = await supabase
      .from("grants")
      .insert({
        title: grant.title,
        organization: grant.organization,
        area: grant.area || "social",
        max_value: grant.max_value || 0,
        deadline: grant.deadline || null,
        eligibility: grant.eligibility || "",
        description: grant.description || "",
        source_url: sourceUrl,
        source_type: sourceType,
        raw_content: contentToAnalyze.substring(0, 10000),
        is_active: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, grant: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("parse-grant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
