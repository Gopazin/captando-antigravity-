import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, HelpCircle, PhoneCall, ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const contactOptions = [
    {
      title: "WhatsApp Suporte",
      description: "Fale com um consultor agora",
      icon: MessageCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      action: () => window.open("https://wa.me/5500000000000", "_blank")
    },
    {
      title: "Email Direto",
      description: "Precisa de algo mais formal?",
      icon: Mail,
      color: "text-accent",
      bg: "bg-accent/10",
      action: () => window.location.href = "mailto:suporte@captando.ai"
    },
    {
      title: "Central de Ajuda",
      description: "Tutoriais e documentação",
      icon: HelpCircle,
      color: "text-primary",
      bg: "bg-primary/10",
      action: () => window.open("/ajuda", "_blank")
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <div className="h-1.5 bg-accent w-full" />
        
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="bg-accent/10 w-fit p-3 rounded-2xl mb-4">
              <PhoneCall className="h-6 w-6 text-accent" />
            </div>
            <DialogTitle className="text-2xl font-black text-foreground">Como podemos ajudar?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Escolha o canal de sua preferência. Nosso time está pronto para acelerar sua captação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {contactOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full h-20 items-center justify-between p-4 border-border/50 hover:bg-muted/50 hover:border-accent/40 transition-all group rounded-2xl overflow-hidden"
                  onClick={option.action}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${option.bg} p-2.5 rounded-xl group-hover:scale-110 transition-transform`}>
                      <option.icon className={`h-5 w-5 ${option.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">{option.title}</p>
                      <p className="text-[11px] text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <div className="bg-muted h-8 w-8 rounded-full flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-4">
              Horário de Atendimento: <span className="text-foreground">Seg-Sex, 09h às 18h</span>
            </p>
            <Button variant="ghost" size="sm" className="text-xs text-accent hover:bg-accent/5 font-bold">
              Visitar Blog Captando <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
