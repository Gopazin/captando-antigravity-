export async function callLLM(
  systemPrompt: string,
  userPrompt: string | any[],
  tools?: any[],
  toolChoice?: any
) {
  // provedores suportados: "openai", "gemini", "lovable"
  // Recomendamos "gemini" pois tem tier gratuito generoso.
  const provider = Deno.env.get("AI_PROVIDER") || "gemini";
  let apiKey = "";
  let baseUrl = "";
  let modelName = "";

  if (provider === "openai") {
    apiKey = Deno.env.get("OPENAI_API_KEY") || "";
    baseUrl = "https://api.openai.com/v1/chat/completions";
    modelName = "gpt-4o-mini"; 
  } else if (provider === "lovable") {
    apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
    baseUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    modelName = "google/gemini-3-flash-preview"; 
  } else {
    // Valor padrão é a API direta do Gemini usando endpoint compatível com OpenAI
    apiKey = Deno.env.get("GEMINI_API_KEY") || "";
    baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    modelName = "gemini-2.5-flash"; 
  }

  if (!apiKey) {
    throw new Error(`A API Key para o provedor definido (${provider}) não está configurada nos Secrets.`);
  }

  let finalMessages: any[] = [{ role: "system", content: systemPrompt }];

  if (Array.isArray(userPrompt) && userPrompt.length > 0 && userPrompt[0].role) {
    // É um array completo de histórico de mensagens
    finalMessages = [...finalMessages, ...userPrompt];
  } else {
    // É apenas o conteúdo do usuário (string ou array de partes multimodais)
    finalMessages.push({ role: "user", content: userPrompt });
  }

  const payload: any = {
    model: modelName,
    messages: finalMessages
  };

  if (tools) {
    payload.tools = tools;
  }
  if (toolChoice) {
    payload.tool_choice = toolChoice;
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API do LLM (${response.status}): ${errorText}`);
  }

  return response.json();
}
