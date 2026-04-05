import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, AlertCircle, TrendingUp, Lightbulb, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EvaluationResult {
  layer: string;
  score: number | null;
  feedback: string;
  suggestions: Record<string, string>;
}

interface ProjectEvaluationResultsProps {
  projectId: string;
  onClose: () => void;
  results: EvaluationResult[];
  isLoading: boolean;
}

export const ProjectEvaluationResults = ({ results, isLoading, onClose }: ProjectEvaluationResultsProps) => {
  const [activeTab, setActiveTab] = useState<string>("merito");

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 8) return "text-emerald-500";
    if (score >= 5) return "text-amber-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number | null) => {
    if (score === null) return "bg-muted";
    if (score >= 8) return "bg-emerald-500";
    if (score >= 5) return "bg-amber-500";
    return "bg-red-500";
  };

  const layers = [
    { id: "conformidade", label: "Conformidade", icon: CheckCircle2 },
    { id: "merito", label: "Mérito", icon: TrendingUp },
    { id: "alinhamento", label: "Alinhamento", icon: Lightbulb },
  ];

  const activeResult = results.find(r => r.layer === activeTab);

  return (
    <Card className="glass-card border-primary/20 shadow-2xl h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Análise de Inteligência
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
        <CardDescription>Simulação de nota baseada no domínio e edital.</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden pt-4">
        {/* Layer Tabs */}
        <div className="flex bg-muted/30 p-1 rounded-lg gap-1">
          {layers.map((layer) => {
            const result = results.find(r => r.layer === layer.id);
            const hasResult = !!result;
            
            return (
              <button
                key={layer.id}
                onClick={() => setActiveTab(layer.id)}
                className={`flex-1 flex flex-col items-center py-2 rounded-md transition-all ${
                  activeTab === layer.id 
                    ? "bg-background shadow-sm text-primary" 
                    : "text-muted-foreground hover:bg-background/50"
                }`}
              >
                <layer.icon className={`h-4 w-4 mb-1 ${activeTab === layer.id ? "text-accent" : ""}`} />
                <span className="text-[10px] font-medium uppercase tracking-wider">{layer.label}</span>
                {hasResult && result.score !== null && (
                  <span className={`text-[10px] font-bold mt-1 ${getScoreColor(result.score)}`}>
                    {result.score}/10
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground animate-pulse">A IA está processando esta camada...</p>
            </div>
          ) : activeResult ? (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Score Display */}
              {activeResult.score !== null && (
                <div className="bg-accent/5 rounded-xl p-4 border border-accent/10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium">Pontuação Estimada</span>
                    <span className={`text-2xl font-bold ${getScoreColor(activeResult.score)}`}>
                      {activeResult.score}<span className="text-sm text-muted-foreground">/10</span>
                    </span>
                  </div>
                  <Progress value={activeResult.score * 10} className={`h-2 ${getProgressColor(activeResult.score)}`} />
                </div>
              )}

              {/* Feedback Text */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Parecer do Avaliador IA
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap p-3 bg-muted/20 rounded-lg">
                  {activeResult.feedback}
                </p>
              </div>

              {/* Suggestions */}
              {Object.keys(activeResult.suggestions).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Sugestões de Melhoria
                  </h4>
                  <div className="grid gap-2">
                    {Object.entries(activeResult.suggestions).map(([campo, sugestao], idx) => (
                      <div key={idx} className="bg-muted/30 p-3 rounded-lg border border-primary/5 hover:border-accent/30 transition-colors group">
                        <p className="text-[10px] font-bold text-accent uppercase mb-1">{campo}</p>
                        <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{sugestao}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">Clique em "Pré-Avaliar" para gerar a análise desta camada.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
