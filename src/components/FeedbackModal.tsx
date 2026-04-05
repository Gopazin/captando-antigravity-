import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { user, organization } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [aiResponse, setAiResponse] = useState("");

  const generateAiHint = (msg: string) => {
    const hints = [
      "Que excelente observação! Já encaminhei isso para nossa equipe de engenharia. Isso pode realmente agilizar o fluxo de captação.",
      "Obrigado por nos ajudar a melhorar! Essa funcionalidade está no nosso radar e sua sugestão nos ajuda a priorizá-la.",
      "Interessante! Vamos analisar como isso pode ser integrado com nossa IA de estruturação de editais.",
      "Anotado! Feedbacks como o seu são o que fazem o Captando crescer. Já salvei no portal do admin."
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Por favor, descreva sua sugestão.");
      return;
    }

    setLoading(true);
    const hint = generateAiHint(message);
    setAiResponse(hint);

    try {
      const { error } = await supabase.from("feedbacks").insert({
        user_id: user?.id,
        organization_id: organization?.id,
        message: message,
        ai_hint: hint,
        status: "pendente"
      });

      if (error) throw error;

      setStep("success");
      setMessage("");
    } catch (error: any) {
      console.error("Error sending feedback:", error);
      toast.error("Erro ao enviar feedback. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    onOpenChange(false);
    // Pequeno delay para resetar o estado após o modal fechar
    setTimeout(() => {
      setStep("form");
      setAiResponse("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence mode="wait">
        {open && (
          <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
            <div className="h-1.5 bg-accent w-full" />
            
            <div className="p-8">
              {step === "form" ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <DialogHeader>
                    <div className="bg-accent/10 w-fit p-3 rounded-2xl mb-4">
                      <MessageSquare className="h-6 w-6 text-accent" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-foreground">Como podemos melhorar?</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                      Sua visão como capitador é fundamental. Conte para a nossa IA o que você gostaria de ver na plataforma.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Ex: Gostaria de exportar relatórios em PDF..."
                      className="min-h-[120px] bg-muted/30 border-border/50 focus:border-accent/40 resize-none rounded-xl"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button 
                      onClick={handleSend}
                      disabled={loading}
                      className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Enviar Sugestão <Send className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-center py-6 space-y-6"
                >
                  <div className="bg-emerald-500/10 w-fit p-4 rounded-full mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Feedback Enviado!</h3>
                    <p className="text-sm text-muted-foreground">Obrigado pela sua contribuição.</p>
                  </div>

                  <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Resposta da Nossa IA</span>
                    </div>
                    <p className="text-sm italic leading-relaxed text-foreground font-medium">
                      "{aiResponse}"
                    </p>
                    <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-accent/5 rounded-full blur-xl" />
                  </div>

                  <Button variant="outline" className="w-full h-12 rounded-xl" onClick={resetAndClose}>
                    Continuar Navegando
                  </Button>
                </motion.div>
              )}
            </div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
