import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sparkles, ChevronRight, ChevronLeft, Check, Loader2, Send, Bot, User } from "lucide-react";
import { mockGrants, mockOrganization } from "@/data/mock";
import { AREA_LABELS } from "@/types";

const steps = [
  { id: 1, title: "Seleção", description: "Escolha o perfil e edital" },
  { id: 2, title: "Ideação", description: "Defina a ideia do projeto" },
  { id: 3, title: "Estruturação", description: "Geração automática com IA" },
  { id: 4, title: "Refinamento", description: "Refine o projeto final" },
];

const Assistente = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGrant, setSelectedGrant] = useState("");
  const [briefing, setBriefing] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    justification: "",
    objectives: "",
    methodology: "",
  });
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedContent({
        title: "Arte na Periferia: Oficinas Culturais para Transformação Social",
        justification: "A falta de acesso à cultura nas regiões periféricas de São Paulo contribui significativamente para a exclusão social e a limitação de oportunidades para jovens e adultos. Segundo dados do IBGE (2023), apenas 12% dos moradores de comunidades periféricas têm acesso regular a atividades culturais. Este projeto justifica-se pela necessidade urgente de democratizar o acesso à arte e cultura como ferramentas de transformação social, alinhando-se diretamente aos objetivos do edital de fomento cultural.",
        objectives: "Objetivo Geral: Promover a inclusão cultural e o desenvolvimento artístico em 5 comunidades periféricas de São Paulo.\n\nObjetivos Específicos:\n1. Realizar 20 oficinas semanais de arte (teatro, música, artes visuais e dança)\n2. Atender 500 participantes ao longo de 12 meses\n3. Formar 10 multiplicadores culturais comunitários\n4. Realizar 5 mostras artísticas abertas à comunidade\n5. Criar uma rede de artistas periféricos conectada digitalmente",
        methodology: "O projeto será desenvolvido em 4 fases:\n\n1. Mobilização (Meses 1-2): Articulação com lideranças comunitárias, mapeamento de espaços e inscrição de participantes.\n\n2. Execução (Meses 3-10): Realização das oficinas com metodologia participativa, utilizando técnicas de arte-educação e pedagogia do oprimido.\n\n3. Culminância (Meses 11-12): Organização de mostras artísticas, documentação audiovisual e formação de multiplicadores.\n\n4. Avaliação: Acompanhamento contínuo com indicadores quantitativos e qualitativos.",
      });
      setIsGenerating(false);
      setCurrentStep(4);
    }, 3000);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Entendido! Ajustei o texto conforme solicitado. A justificativa agora está mais técnica, com dados estatísticos adicionais e referências a políticas públicas relevantes." },
      ]);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistente de Projetos</h1>
        <p className="text-muted-foreground mt-1">Crie projetos estruturados com auxílio da IA</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentStep === step.id ? "bg-primary text-primary-foreground" :
              currentStep > step.id ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
            }`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                currentStep > step.id ? "bg-accent text-accent-foreground" : "bg-background/20"
              }`}>
                {currentStep > step.id ? <Check className="h-3 w-3" /> : step.id}
              </span>
              <span className="hidden sm:inline">{step.title}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step 1 - Seleção */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Seleção de Perfil e Edital</CardTitle>
            <CardDescription>Escolha o perfil da organização e o edital alvo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Perfil do Cofre</Label>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="font-medium">{mockOrganization.name}</p>
                <p className="text-sm text-muted-foreground">{mockOrganization.cnpj} · {mockOrganization.location}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Edital Alvo</Label>
              <Select value={selectedGrant} onValueChange={setSelectedGrant}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um edital" />
                </SelectTrigger>
                <SelectContent>
                  {mockGrants.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title} — {AREA_LABELS[g.area]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button disabled={!selectedGrant} onClick={() => setCurrentStep(2)}>
                Próximo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 - Ideação */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Ideação do Projeto</CardTitle>
            <CardDescription>Descreva sua ideia ou peça sugestões à IA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>O que você pretende fazer neste projeto?</Label>
              <Textarea
                rows={5}
                placeholder="Descreva brevemente a ideia do seu projeto..."
                value={briefing}
                onChange={(e) => setBriefing(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
              <Sparkles className="h-4 w-4 mr-2" /> Sugerir com IA
            </Button>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
              <Button disabled={!briefing.trim()} onClick={() => { setCurrentStep(3); handleGenerate(); }}>
                Gerar Projeto <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 - Estruturação (Loading) */}
      {currentStep === 3 && isGenerating && (
        <Card>
          <CardContent className="py-20 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent" />
            <div>
              <p className="text-lg font-semibold">A IA está estruturando seu projeto...</p>
              <p className="text-sm text-muted-foreground mt-1">Combinando dados do Cofre + Edital + sua ideia</p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {["Analisando Cofre", "Lendo Edital", "Gerando Texto"].map((s, i) => (
                <Badge key={s} variant="secondary" className={i <= 1 ? "bg-accent/15 text-accent" : ""}>
                  {i <= 1 && <Check className="h-3 w-3 mr-1" />} {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 - Refinamento */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projeto Gerado</CardTitle>
                <CardDescription>Edite livremente o conteúdo abaixo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Título</Label>
                  <Input value={generatedContent.title} onChange={(e) => setGeneratedContent((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Justificativa</Label>
                  <Textarea rows={6} value={generatedContent.justification} onChange={(e) => setGeneratedContent((p) => ({ ...p, justification: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Objetivos</Label>
                  <Textarea rows={8} value={generatedContent.objectives} onChange={(e) => setGeneratedContent((p) => ({ ...p, objectives: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Metodologia</Label>
                  <Textarea rows={8} value={generatedContent.methodology} onChange={(e) => setGeneratedContent((p) => ({ ...p, methodology: e.target.value }))} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                  </Button>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1">
                    <Check className="h-4 w-4 mr-2" /> Finalizar Projeto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat lateral */}
          <Card className="flex flex-col h-[calc(100vh-16rem)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4 text-accent" /> Chat com IA
              </CardTitle>
              <CardDescription className="text-xs">Peça alterações no texto gerado</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {chatMessages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Peça alterações como:</p>
                    <p className="italic mt-1">"Torne a justificativa mais técnica"</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && <Bot className="h-5 w-5 text-accent mt-1 shrink-0" />}
                    <div className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === "user" && <User className="h-5 w-5 text-primary mt-1 shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Peça uma alteração..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                />
                <Button size="icon" onClick={handleSendChat} className="bg-accent hover:bg-accent/90 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Assistente;
