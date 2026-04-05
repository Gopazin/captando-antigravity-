import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban, FileText, Clock, TrendingUp, ArrowRight, Loader2,
  DollarSign, AlertTriangle, Radar, ShieldCheck, Sparkles, Activity, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, type Project } from "@/hooks/useProjects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quick View States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedGrant, setSelectedGrant] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [projRes, grantRes] = await Promise.all([
        supabase.from("projects").select("*").neq("status", "arquivado").order("updated_at", { ascending: false }).limit(5),
        supabase.from("grants").select("*").eq("is_active", true).order("deadline", { ascending: true }).limit(10),
      ]);
      setProjects((projRes.data as unknown as Project[]) || []);
      setGrants(grantRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const activeProjects = projects.filter((p) => !["concluido", "arquivado"].includes(p.status));
  const upcomingGrants = grants.filter((g) => g.deadline && new Date(g.deadline) > new Date());
  const totalBudget = projects.reduce((a, p) => a + (p.budget || 0), 0);

  const stats = [
    { 
      label: "Projetos Ativos", 
      value: activeProjects.length, 
      icon: FolderKanban, 
      color: "text-accent", 
      bg: "bg-accent/10",
      trend: "up",
      trendValue: "+12%" 
    },
    { 
      label: "Editais no Radar", 
      value: grants.length, 
      icon: Radar, 
      color: "text-accent", 
      bg: "bg-accent/10",
      trend: "up",
      trendValue: "+5" 
    },
    { 
      label: "Prazos Próximos", 
      value: upcomingGrants.filter((g) => {
        const d = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
        return d <= 30 && d > 0;
      }).length, 
      icon: Clock, 
      color: "text-warning", 
      bg: "bg-warning/10",
      trend: "down",
      trendValue: "-2" 
    },
    { 
      label: "Recursos Captados", 
      value: `R$ ${(totalBudget / 1000).toFixed(0)}k`, 
      icon: DollarSign, 
      color: "text-accent", 
      bg: "bg-accent/10",
      trend: "up",
      trendValue: "+24%" 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Quick Insight Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-card p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5 px-2 py-0.5 font-bold">
                <Sparkles className="h-3 w-3 mr-1" /> IA Ativa
              </Badge>
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-2 py-0.5 font-bold">
                Prazos em Dia
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bem-vindo ao Captando!
            </h1>
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              Resumo do dia: Você tem <strong className="text-foreground">{upcomingGrants.length} oportunidades</strong> no radar e <strong className="text-foreground">{activeProjects.length} projetos</strong> ativos.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate("/escritorio/assistente")} className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0 shadow-lg shadow-accent/20 h-12 px-6">
            <Sparkles className="h-4 w-4 mr-2" /> Estruturar Novo Projeto
          </Button>
        </div>
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="group hover:shadow-lg transition-all duration-300 border-none bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-sans">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${stat.trend === 'up' ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'}`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.trendValue}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">vs. mês anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects List */}
        <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/5 py-4 px-6">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <FolderKanban className="h-4 w-4 text-accent" />
              Projetos Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/escritorio/kanban")} className="text-xs font-semibold hover:bg-accent/5 hover:text-accent">
              Ver todos <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="bg-muted/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderKanban className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum projeto em andamento</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/escritorio/assistente")}>
                  <Sparkles className="h-4 w-4 mr-1" /> Novo Projeto IA
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {projects.slice(0, 4).map((project) => (
                  <div 
                    key={project.id} 
                    className="group flex items-center justify-between p-5 hover:bg-muted/30 transition-all cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="font-semibold text-sm group-hover:text-accent transition-colors">{project.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Progress value={project.progress} className="h-1 w-20 bg-muted" />
                        <span className="text-[10px] font-bold text-muted-foreground">{project.progress}% concluído</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`${PROJECT_STATUS_COLORS[project.status]} bg-opacity-10 border-none font-bold text-[10px] uppercase px-2 py-0.5`}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grants Radar List */}
        <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/5 py-4 px-6">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Radar className="h-4 w-4 text-accent" />
              Oportunidades em Destaque
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/editais")} className="text-xs font-semibold hover:bg-accent/5 hover:text-accent">
              Radar <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {grants.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Radar className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Buscando novas oportunidades...</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {grants.slice(0, 4).map((grant) => {
                  const daysLeft = grant.deadline ? Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / 86400000) : null;
                  return (
                    <div 
                      key={grant.id} 
                      className="group flex items-center justify-between p-5 hover:bg-muted/30 transition-all cursor-pointer"
                      onClick={() => setSelectedGrant(grant)}
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="font-semibold text-sm group-hover:text-accent transition-colors truncate">{grant.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Activity className="h-3 w-3" /> {grant.organization}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {daysLeft !== null && (
                          <div className={`flex flex-col items-end gap-1`}>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${daysLeft <= 15 ? "text-destructive" : "text-accent"}`}>
                              Expira em
                            </span>
                            <Badge variant="outline" className={`font-black text-xs ${daysLeft <= 15 ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-accent/30 bg-accent/5 text-accent"}`}>
                              {daysLeft} dias
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="py-4 px-6 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Activity className="h-4 w-4 text-accent" />
              Atividade do Ecossistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {[
              { icon: CheckCircle2, text: 'Projeto "Oficina de Cultura" gerado com IA', time: 'Há 2 horas', source: 'Assistente Master' },
              { icon: Radar, text: '5 novos editais mapeados no PNCP para sua região', time: 'Há 5 horas', source: 'Radar Automático' },
              { icon: ShieldCheck, text: 'Documentação do Cofre de Identidade validada', time: 'Ontem', source: 'Compliance Check' }
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0 last:before:hidden before:absolute before:left-[11px] before:top-[30px] before:bottom-0 before:w-[2px] before:bg-border/50">
                <div className="bg-accent/10 p-1.5 rounded-full z-10">
                  <activity.icon className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{activity.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground font-medium">{activity.time}</span>
                    <span className="text-white/10 dark:text-white/5 mx-2">•</span>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">{activity.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="bg-accent/5 border-accent/20 border shadow-none relative overflow-hidden group">
          <CardHeader className="pb-2">
            <Badge variant="outline" className="w-fit text-[10px] border-accent/30 bg-accent/5 text-accent font-bold uppercase tracking-widest">
              Dica da IA
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed font-medium">
              Identifiquei que o edital <span className="text-accent underline decoration-accent/30 underline-offset-2 cursor-pointer">"Fomento à Arte"</span> tem 92% de aderência ao perfil da sua organização.
            </p>
            <div className="p-3 bg-background/50 rounded-xl border border-accent/10">
              <p className="text-[11px] text-muted-foreground">Posso gerar a proposta técnica completa agora mesmo.</p>
            </div>
            <Button variant="default" className="w-full bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 group-hover:scale-[1.02] transition-transform" onClick={() => navigate('/escritorio/assistente')}>
              Iniciar Proposta <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl group-hover:blur-3xl transition-all" />
        </Card>
      </div>

      {/* QUICK VIEW MODALS */}
      
      {/* Project Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden border-none shadow-2xl">
          <div className="h-1 bg-accent w-full" />
          <DialogHeader className="p-8 pb-4">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className={`${selectedProject ? PROJECT_STATUS_COLORS[selectedProject.status] : ''} font-bold`}>
                {selectedProject && PROJECT_STATUS_LABELS[selectedProject.status]}
              </Badge>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">Atualizado em {selectedProject?.updated_at ? new Date(selectedProject.updated_at).toLocaleDateString('pt-BR') : '-'}</span>
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">{selectedProject?.title}</DialogTitle>
            <div className="text-base mt-2 line-clamp-3 text-muted-foreground">
              {selectedProject?.description || "Sem descrição disponível para este projeto."}
            </div>
          </DialogHeader>
          
          <div className="p-8 pt-0 grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Recurso Pretendido</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  <span className="text-xl font-bold font-mono">
                    {selectedProject?.budget ? `R$ ${selectedProject.budget.toLocaleString('pt-BR')}` : 'R$ 0,00'}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status Interno</p>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  <span className="text-base font-semibold">Fase Executiva</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
               <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Progresso Atual</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{selectedProject?.progress}%</span>
                    <span className="text-[10px] font-medium text-accent">Excelente</span>
                  </div>
                  <Progress value={selectedProject?.progress} className="h-2" />
                </div>
              </div>
              <Button className="w-full h-12 bg-accent hover:bg-accent/90 font-bold" onClick={() => {
                setSelectedProject(null);
                navigate(`/gestao-projetos/${selectedProject?.id}`);
              }}>
                Ver Workspace do Projeto <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grant Modal */}
      <Dialog open={!!selectedGrant} onOpenChange={() => setSelectedGrant(null)}>
        <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden border-none shadow-2xl">
          <div className="h-1 bg-accent w-full" />
          <DialogHeader className="p-8 pb-4">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-accent/10 text-accent hover:bg-accent/15 border-none font-bold">
                {selectedGrant?.category || 'Edital Aberto'}
              </Badge>
              {selectedGrant?.deadline && (
                 <div className="flex items-center gap-2 text-destructive font-bold">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Prazo: {new Date(selectedGrant.deadline).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">{selectedGrant?.title}</DialogTitle>
            <div className="text-sm mt-2 opacity-80 leading-relaxed text-muted-foreground">
              Oportunidade mapeada via radar automático. Este edital é compatível com o histórico da sua organização e possui alto potencial de êxito.
            </div>
          </DialogHeader>
          
          <div className="p-8 pt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Órgão Emissor</p>
                  <p className="font-semibold text-sm">{selectedGrant?.organization || 'Não informado'}</p>
               </div>
               <div className="p-4 rounded-xl border border-border/50 bg-accent/[0.02]">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Valor do Edital</p>
                  <p className="font-bold text-lg font-mono text-accent">R$ 500.000,00+</p>
               </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">O que podemos fazer?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start gap-4 h-14 border-accent/20 hover:border-accent/40 hover:bg-accent/5">
                  <div className="bg-accent/10 p-2 rounded-lg"><FileText className="h-4 w-4 text-accent" /></div>
                  <div className="text-left">
                    <p className="text-xs font-bold">Resumo por IA</p>
                    <p className="text-[10px] text-muted-foreground">Pontos chaves do edital</p>
                  </div>
                </Button>
                <Button className="justify-start gap-4 h-14 bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
                  <div className="bg-white/20 p-2 rounded-lg"><Sparkles className="h-4 w-4 text-white" /></div>
                  <div className="text-left">
                    <p className="text-xs font-bold">Gerar Pré-proposta</p>
                    <p className="text-[10px] text-accent-foreground/70">Estruturar rascunho</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;