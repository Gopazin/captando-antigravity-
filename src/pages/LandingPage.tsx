import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Radar,
  ShieldCheck,
  BrainCircuit,
  FileSearch,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  Target,
  Users,
  TrendingUp,
  ChevronRight,
  Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const stats = [
  { value: "R$ 12B+", label: "Disponíveis em editais públicos/ano" },
  { value: "72%", label: "Dos projetos são reprovados por erros formais" },
  { value: "3x", label: "Mais rápido com assistência de IA" },
  { value: "100%", label: "Compliance na prestação de contas" },
];

const painPoints = [
  {
    icon: FileSearch,
    title: "Encontrar editais relevantes é como procurar agulha no palheiro",
    description:
      "São centenas de portais, cada um com seu formato. Você gasta horas buscando e ainda perde prazos por não saber que uma oportunidade existia.",
  },
  {
    icon: Clock,
    title: "Formular projetos consome semanas de trabalho técnico",
    description:
      "Justificativas, metodologias, planos de trabalho, orçamentos detalhados. O tempo entre o edital e o prazo nunca é suficiente.",
  },
  {
    icon: AlertTriangle,
    title: "Um erro no compliance pode devolver milhões ao governo",
    description:
      "Prestação de contas, rubricas, cronogramas de execução. A burocracia é implacável e qualquer deslize gera sanções graves.",
  },
];

const features = [
  {
    icon: Radar,
    title: "Radar de Editais",
    description:
      "Monitoramento automático de editais do PNCP, portais estaduais e plataformas como Prosas e FBB. Filtros por região, valor e área de atuação.",
    badge: "Automático",
  },
  {
    icon: BrainCircuit,
    title: "Escritório de Projetos com IA",
    description:
      "A IA cruza dados da sua organização com o edital selecionado e gera projetos completos: justificativa, metodologia, objetivos e orçamento.",
    badge: "IA Generativa",
  },
  {
    icon: Lock,
    title: "Cofre de Identidade",
    description:
      "Armazene CNPJ, estatutos, portfólio e histórico da organização. Esses dados alimentam a IA para gerar projetos personalizados e aderentes.",
    badge: "Seguro",
  },
  {
    icon: ShieldCheck,
    title: "Gestão & Compliance",
    description:
      "Kanban de execução, gestor de rubricas (Custeio vs Capital), alertas de prazos e módulo completo de prestação de contas.",
    badge: "End-to-End",
  },
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    description:
      "Visão consolidada de recursos captados, projetos em andamento, taxas de aprovação e alertas prioritários em tempo real.",
    badge: "Analytics",
  },
  {
    icon: Target,
    title: "Gestão de Projetos",
    description:
      "Kanban profissional com 8 fases, tarefas priorizadas, notas de atividade e assistência de IA para sugerir próximos passos estratégicos.",
    badge: "Produtividade",
  },
];

const aiCapabilities = [
  {
    title: "Geração Automática de Projetos",
    description:
      "Descreva sua ideia em poucas palavras. A IA analisa o edital, cruza com o perfil da sua organização e gera um projeto completo, pronto para revisão.",
    icon: Zap,
  },
  {
    title: "Sugestão Inteligente de Tarefas",
    description:
      "Para cada fase do projeto, a IA sugere tarefas específicas baseadas em boas práticas de captação e nas exigências do edital vinculado.",
    icon: CheckCircle2,
  },
  {
    title: "Análise de Progresso e Riscos",
    description:
      "A IA monitora o andamento do projeto, identifica gargalos e recomenda ações corretivas antes que se tornem problemas reais.",
    icon: TrendingUp,
  },
  {
    title: "Consultor de Captação 24/7",
    description:
      "Um agente de IA especializado em captação de recursos públicos, disponível a qualquer momento para tirar dúvidas e orientar decisões.",
    icon: BrainCircuit,
  },
];

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para organizações começando na captação",
    features: [
      "1 projeto ativo",
      "Busca manual de editais",
      "Cofre de Identidade básico",
      "Dashboard simplificado",
    ],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 197",
    period: "/mês",
    description: "Para organizações que captam com frequência",
    features: [
      "Projetos ilimitados",
      "Radar automático de editais",
      "IA para geração de projetos",
      "Gestão & Compliance completo",
      "Dashboard com analytics",
      "Suporte prioritário",
    ],
    cta: "Assinar Agora",
    highlighted: true,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-lg">
              C
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Captando
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#ia" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Inteligência Artificial
            </a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              Login
            </Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/")}>
              Começar Grátis
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 hover:bg-accent/15">
              <Zap className="mr-1 h-3 w-3" /> Plataforma com IA integrada
            </Badge>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Captação inteligente e gestão segura de{" "}
            <span className="text-accent">recursos públicos</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Encontre editais automaticamente, gere projetos com IA e gerencie todo o ciclo de captação — 
            da oportunidade à prestação de contas — em uma única plataforma.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 text-base"
              onClick={() => navigate("/")}
            >
              Começar Grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 text-base" asChild>
              <a href="#funcionalidades">Ver Funcionalidades</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-accent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="border-y border-border bg-card py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight md:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Se você trabalha com captação de recursos, já sentiu essas dores
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A captação de recursos públicos no Brasil é um processo complexo, burocrático e cheio de armadilhas. Nós entendemos cada uma delas.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {painPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full border-destructive/10 bg-destructive/[0.02]">
                  <CardContent className="p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                      <point.icon className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold leading-snug">{point.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Módulos da Plataforma</Badge>
            <h2
              className="text-3xl font-bold tracking-tight md:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Do monitoramento de editais à prestação de contas, cada módulo foi desenhado para eliminar gargalos e maximizar suas chances de aprovação.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="group h-full transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5">
                  <CardContent className="p-8">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent/20">
                        <feature.icon className="h-5 w-5 text-accent" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ia" className="border-y border-border bg-primary py-20 text-primary-foreground md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">Inteligência Artificial</Badge>
              <h2
                className="text-3xl font-bold tracking-tight md:text-4xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Sua equipe de captação, potencializada por IA
              </h2>
              <p className="mt-4 text-primary-foreground/70 leading-relaxed">
                A inteligência artificial do Captando não substitui o profissional — ela o torna imbatível. 
                Desde a leitura automática de editais até a geração de projetos completos, 
                cada funcionalidade foi treinada com as melhores práticas de captação de recursos no Brasil.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate("/")}
                >
                  Experimentar a IA <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {aiCapabilities.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  custom={i}
                  className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm"
                >
                  <cap.icon className="mb-3 h-6 w-6 text-accent" />
                  <h3 className="text-sm font-semibold">{cap.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-primary-foreground/60">{cap.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Feito para quem leva captação a sério
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Prefeituras, ONGs, associações, fundações e empresas já estão transformando a forma como captam e gerem recursos públicos.
          </p>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                quote:
                  "Antes levávamos 3 semanas para montar um projeto. Com o Captando, reduzimos para 3 dias.",
                author: "Diretora de Projetos",
                org: "ONG Educação Viva",
              },
              {
                quote:
                  "O radar de editais nos trouxe oportunidades que nunca teríamos encontrado sozinhos.",
                author: "Secretário de Cultura",
                org: "Prefeitura Municipal",
              },
              {
                quote:
                  "A gestão de compliance nos deu a segurança que precisávamos para escalar nossas captações.",
                author: "Coordenador Financeiro",
                org: "Instituto Social Brasil",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground italic">"{testimonial.quote}"</p>
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="text-sm font-semibold">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.org}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="border-y border-border bg-card py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight md:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Planos que cabem na sua realidade
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Comece gratuitamente e evolua conforme a sua necessidade de captação cresce.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-8 md:grid-cols-2">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card
                  className={`relative h-full ${
                    plan.highlighted
                      ? "border-accent shadow-xl shadow-accent/10"
                      : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-accent text-accent-foreground">Mais Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span
                        className="text-4xl font-bold"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="mt-8 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`mt-8 w-full ${
                        plan.highlighted
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : ""
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                      onClick={() => navigate("/")}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2
              className="mx-auto max-w-3xl text-3xl font-bold tracking-tight md:text-5xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Pare de perder editais. Comece a captar com inteligência.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Junte-se às organizações que estão profissionalizando a captação de recursos públicos no Brasil.
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-10 text-base"
                onClick={() => navigate("/")}
              >
                Criar Conta Grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-primary py-12 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
                  C
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Captando
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/60">
                Captando é a infraestrutura definitiva para o ciclo completo do recurso público. 
                Unimos inteligência artificial de ponta, monitoramento ativo de editais e uma gestão de compliance rigorosa 
                para transformar a captação de recursos em um processo seguro, profissional e escalável para prefeituras, associações e empresas.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Plataforma</h4>
              <ul className="mt-4 space-y-2 text-sm text-primary-foreground/60">
                <li><a href="#funcionalidades" className="hover:text-accent transition-colors">Funcionalidades</a></li>
                <li><a href="#ia" className="hover:text-accent transition-colors">Inteligência Artificial</a></li>
                <li><a href="#planos" className="hover:text-accent transition-colors">Planos e Preços</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-primary-foreground/60">
                <li><a href="#" className="hover:text-accent transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Captando. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
