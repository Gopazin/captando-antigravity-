import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, FileEdit, Eye, CheckCircle2 } from "lucide-react";
import { mockProjects, mockGrants } from "@/data/mock";
import { STATUS_LABELS } from "@/types";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { color: string; icon: typeof FileEdit }> = {
  rascunho: { color: "bg-muted text-muted-foreground", icon: FileEdit },
  em_revisao: { color: "bg-warning/15 text-warning border-warning/30", icon: Eye },
  finalizado: { color: "bg-accent/15 text-accent border-accent/30", icon: CheckCircle2 },
};

const Projetos = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Projetos</h1>
          <p className="text-muted-foreground mt-1">Projetos em elaboração ou finalizados</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => navigate("/assistente")}>
          <Plus className="h-4 w-4 mr-2" /> Novo Projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockProjects.map((project) => {
          const grant = mockGrants.find((g) => g.id === project.grantId);
          const config = statusConfig[project.status];
          const Icon = config.icon;

          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className={config.color}>
                    <Icon className="h-3 w-3 mr-1" />
                    {STATUS_LABELS[project.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Fase {project.currentStep}/4</span>
                </div>
                <CardTitle className="text-lg mt-2">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {grant && (
                  <p className="text-sm text-muted-foreground">
                    Edital: {grant.title}
                  </p>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2">{project.briefing}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Atualizado em {new Date(project.updatedAt).toLocaleDateString("pt-BR")}
                  </span>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Continuar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Projetos;
