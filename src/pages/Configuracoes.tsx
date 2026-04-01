import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Save, Crown, Check, X, Activity, Database, Server, Key, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const plans = [
  {
    name: "Free",
    price: "Grátis",
    current: true,
    features: [
      { text: "1 projeto ativo", included: true },
      { text: "Banco de Editais manual", included: true },
      { text: "Cofre de Identidade", included: true },
      { text: "Busca automática de editais", included: false },
      { text: "IA Orçamentária", included: false },
      { text: "Gestão & Compliance", included: false },
    ],
  },
  {
    name: "Pro",
    price: "R$ 97/mês",
    current: false,
    features: [
      { text: "Projetos ilimitados", included: true },
      { text: "Radar de Editais (PNCP + Webscraping)", included: true },
      { text: "Cofre de Identidade avançado", included: true },
      { text: "Busca automática diária", included: true },
      { text: "IA Orçamentária completa", included: true },
      { text: "Gestão & Compliance End-to-End", included: true },
    ],
  },
];

const Configuracoes = () => {
  const [dbStatus, setDbStatus] = useState<"checking" | "ok" | "error">("checking");
  const [edgeStatus, setEdgeStatus] = useState<"checking" | "ok" | "error">("checking");
  const [errorDetails, setErrorDetails] = useState<string>("");

  const checkConnectivity = async () => {
    setDbStatus("checking");
    setEdgeStatus("checking");
    setErrorDetails("");

    try {
      // 1. Check Supabase Database Auth & Access
      const { data: dbData, error: dbError } = await supabase.from('grants').select('id').limit(1);
      if (dbError) throw new Error("DB Connection Error: " + dbError.message);
      setDbStatus("ok");

      // 2. Check Edge Functions (AI Services)
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke("search-grants", {
        body: { test_ping: true },
      });
      // Even if it returns a known error missing the real payload, if we reach it we verify network + CORS
      if (edgeError) {
        console.warn("Edge returned error:", edgeError);
        // We consider it OK if the function exists and responds, even with an error status, 
        // but if it's a completely failed invoke mapping to 'Failed to fetch', it's an error.
        if (edgeError.message === "Failed to send a request to the Edge Function") {
           throw new Error("Edge Function Unreachable: " + edgeError.message);
        }
      }
      setEdgeStatus("ok");

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error);
      if (dbStatus === "checking") setDbStatus("error");
      setEdgeStatus("error");
      setErrorDetails(error.message || "Erro desconhecido de conexão.");
    }
  };

  useEffect(() => {
    checkConnectivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 max-w-3xl pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil, assinatura e conexões</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Perfil do Usuário
          </CardTitle>
          <CardDescription>Suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input defaultValue="Maria Silva" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input defaultValue="maria@exemplo.com" type="email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Input defaultValue="Coordenadora de Projetos" />
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" /> Salvar Perfil
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Planos
          </CardTitle>
          <CardDescription>Escolha o plano ideal para sua organização.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-5 rounded-xl border-2 transition-colors ${
                  plan.current
                    ? "border-primary/30 bg-primary/5"
                    : "border-accent/30 bg-accent/5 hover:border-accent"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {!plan.current && <Crown className="h-4 w-4 text-accent" />}
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                  </div>
                  {plan.current && <Badge variant="secondary">Atual</Badge>}
                </div>
                <p className="text-2xl font-bold mb-4">{plan.price}</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <Check className="h-4 w-4 text-accent shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? "" : "text-muted-foreground/60"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full mt-4 ${plan.current ? "" : "bg-accent hover:bg-accent/90 text-accent-foreground"}`}
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Plano Atual" : "Fazer Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/20 bg-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" /> Diagnóstico de Serviços
              </CardTitle>
              <CardDescription>Status das conexões com Supabase e Serviços de IA.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={checkConnectivity} disabled={dbStatus === "checking" || edgeStatus === "checking"}>
              <RefreshCw className={`h-4 w-4 mr-2 ${dbStatus === "checking" ? "animate-spin" : ""}`} />
              Testar Conexão
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Database Test */}
            <div className="p-4 rounded-lg flex items-center justify-between bg-background border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md"><Database className="h-4 w-4" /></div>
                <div>
                  <p className="font-medium text-sm">Banco de Dados</p>
                  <p className="text-xs text-muted-foreground">PostgreSQL (Supabase)</p>
                </div>
              </div>
              <div>
                {dbStatus === "checking" && <Badge variant="secondary" className="animate-pulse">Check...</Badge>}
                {dbStatus === "ok" && <Badge className="bg-success text-success-foreground hover:bg-success/90">Online</Badge>}
                {dbStatus === "error" && <Badge variant="destructive">Falha</Badge>}
              </div>
            </div>

            {/* Edge Functions / AI Test */}
            <div className="p-4 rounded-lg flex items-center justify-between bg-background border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md"><Server className="h-4 w-4" /></div>
                <div>
                  <p className="font-medium text-sm">Edge Functions (IA)</p>
                  <p className="text-xs text-muted-foreground">Deno / OpenAI via Lovable</p>
                </div>
              </div>
              <div>
                {edgeStatus === "checking" && <Badge variant="secondary" className="animate-pulse">Check...</Badge>}
                {edgeStatus === "ok" && <Badge className="bg-success text-success-foreground hover:bg-success/90">Online</Badge>}
                {edgeStatus === "error" && <Badge variant="destructive">Falha</Badge>}
              </div>
            </div>
          </div>

          {errorDetails && (
            <div className="p-3 bg-destructive/10 border-l-2 border-destructive rounded-r text-sm text-destructive flex items-start gap-2 mt-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span><strong>Erro Detectado:</strong> {errorDetails}<br/>Verifique as chaves de API no Supabase Secrets (ex: `LOVABLE_API_KEY`).</span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground pt-2">
            <p className="flex items-center gap-1.5"><Key className="h-3 w-3 inline" /> Segredos Requeridos (Supabase Edge): <strong>LOVABLE_API_KEY</strong> ou chaves de provedores equivalentes (OpenAI, Gemini).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;