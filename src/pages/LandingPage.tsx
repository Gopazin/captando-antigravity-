import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
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
  TrendingUp,
  ChevronRight,
  Star,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stats = [
  { value: "R$ 12B+", label: "Disponíveis em editais abertos/ano" },
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
    title: "Um erro no compliance pode custar o projeto inteiro",
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
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: BrainCircuit,
    title: "Escritório de Projetos com IA",
    description:
      "A IA cruza dados da sua organização com o edital selecionado e gera projetos completos: justificativa, metodologia, objetivos e orçamento.",
    badge: "IA Avançada",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    icon: Lock,
    title: "Cofre de Identidade",
    description:
      "Armazene CNPJ, estatutos, portfólio e histórico da organização. Esses dados alimentam a IA para gerar projetos personalizados e aderentes.",
    badge: "Seguro",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: ShieldCheck,
    title: "Gestão & Compliance",
    description:
      "Kanban de execução, gestor de rubricas (Custeio vs Capital), alertas de prazos e módulo completo de prestação de contas.",
    badge: "End-to-End",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    description:
      "Visão consolidada de recursos captados, projetos em andamento, taxas de aprovação e alertas prioritários em tempo real.",
    badge: "Analytics",
    badgeColor: "bg-sky-100 text-sky-700",
  },
  {
    icon: Target,
    title: "Gestão de Projetos",
    description:
      "Kanban profissional com 8 fases, tarefas priorizadas, notas de atividade e assistência de IA para sugerir próximos passos estratégicos.",
    badge: "Produtividade",
    badgeColor: "bg-pink-100 text-pink-700",
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
      "Um agente de IA especializado em captação de recursos, disponível a qualquer momento para tirar dúvidas e orientar decisões estratégicas.",
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Logo variant="horizontal" theme="light" />
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#funcionalidades" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Funcionalidades
            </a>
            <a href="#ia" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Inteligência Artificial
            </a>
            <a href="#planos" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Planos
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden md:block"
              onClick={() => navigate("/")}
            >
              Login
            </button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4"
              onClick={() => navigate("/")}
            >
              Começar Grátis
            </Button>
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-4">
            <a href="#funcionalidades" className="block text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Funcionalidades</a>
            <a href="#ia" className="block text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Inteligência Artificial</a>
            <a href="#planos" className="block text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Planos</a>
            <button className="block text-sm text-gray-600" onClick={() => navigate("/")}>Login</button>
          </div>
        )}
      </nav>

      {/* Hero — Dark Emerald (V1 style) */}
      <section className="relative overflow-hidden bg-[#0D2B1F] py-24 md:py-36">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.15)_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 mb-8">
              <Zap className="h-3 w-3" /> Plataforma com IA integrada
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Capte Recursos e Gerencie{" "}
            <span className="text-emerald-400">Projetos com a Potência da IA</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg text-white/60 md:text-xl leading-relaxed"
          >
            Acelere a busca por editais, automatize a escrita de projetos e eleve sua gestão. 
            Tudo em uma plataforma inteligente.
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
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 text-base rounded-xl shadow-lg shadow-emerald-900/40 transition-all"
              onClick={() => navigate("/")}
            >
              Começar Grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 text-base rounded-xl"
              asChild
            >
              <a href="#funcionalidades">Ver Funcionalidades</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4 border-t border-white/10 pt-12"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-3xl font-bold text-emerald-400"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-white/50 leading-snug">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-gray-50 py-20 md:py-28 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Seus Maiores Desafios na Captação, Resolvidos.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-500">
              A captação de recursos é um processo complexo, burocrático e cheio de armadilhas. 
              Nós entendemos cada uma delas.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {painPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full border-red-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                      <point.icon className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-base font-semibold leading-snug text-gray-900">{point.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">{point.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700 mb-4">
              Módulos da Plataforma
            </span>
            <h2
              className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Tudo que Você Precisa em um Só Lugar.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-500">
              Do monitoramento de editais à prestação de contas, cada módulo foi desenhado para 
              eliminar gargalos e maximizar suas chances de aprovação.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="group h-full border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all duration-300">
                  <CardContent className="p-7">
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                        <feature.icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${feature.badgeColor}`}>
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ia" className="py-20 md:py-28 bg-[#1a1040] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.2)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.1)_0%,_transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 mb-5">
                Inteligência Artificial
              </span>
              <h2
                className="text-3xl font-bold tracking-tight text-white md:text-4xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Sua equipe de captação,{" "}
                <span className="text-emerald-400">potencializada por IA</span>
              </h2>
              <p className="mt-5 text-white/60 leading-relaxed text-base">
                A inteligência artificial do Captando não substitui o profissional — ela o torna imbatível. 
                Desde a leitura automática de editais até a geração de projetos completos, 
                cada funcionalidade foi treinada com as melhores práticas de captação de recursos no Brasil.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl"
                  onClick={() => navigate("/")}
                >
                  Experimentar a IA <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {aiCapabilities.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  custom={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-white/8 transition-all"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                    <cap.icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{cap.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{cap.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 md:py-28 bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2
            className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Feito para quem leva captação a sério
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Prefeituras, ONGs, associações, fundações e empresas já estão transformando a forma como captam e gerenciam seus projetos.
          </p>

          <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              {
                quote: "Antes levávamos 3 semanas para montar um projeto. Com o Captando, reduzimos para 3 dias.",
                author: "Diretora de Projetos",
                org: "ONG Educação Viva",
                initials: "EV",
              },
              {
                quote: "O radar de editais nos trouxe oportunidades que nunca teríamos encontrado sozinhos.",
                author: "Secretário de Cultura",
                org: "Prefeitura Municipal",
                initials: "PM",
              },
              {
                quote: "A gestão de compliance nos deu a segurança que precisávamos para escalar nossas captações.",
                author: "Coordenador Financeiro",
                org: "Instituto Social Brasil",
                initials: "IS",
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
                <Card className="h-full border-gray-100 bg-white shadow-sm text-left">
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600 italic">"{testimonial.quote}"</p>
                    <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{testimonial.author}</p>
                        <p className="text-xs text-gray-400">{testimonial.org}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Planos que cabem na sua realidade
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">
              Comece gratuitamente e evolua conforme a sua necessidade de captação cresce.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-6 md:grid-cols-2">
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
                      ? "border-emerald-400 shadow-xl shadow-emerald-100 ring-1 ring-emerald-400"
                      : "border-gray-100 shadow-sm"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span
                        className="text-4xl font-bold text-gray-900"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {plan.price}
                      </span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                    <ul className="mt-8 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`mt-8 w-full rounded-xl font-semibold ${
                        plan.highlighted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
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
      <section className="py-20 md:py-28 bg-[#0D2B1F]">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2
              className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Pare de perder editais.{" "}
              <span className="text-emerald-400">Comece a captar com inteligência.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/50">
              Junte-se às organizações que estão profissionalizando a captação e gestão de projetos com inteligência artificial.
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-10 text-base rounded-xl shadow-lg shadow-emerald-900/40"
                onClick={() => navigate("/")}
              >
                Criar Conta Grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a3a28] bg-[#0a1f14] py-14 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo variant="horizontal" theme="dark" className="mb-4" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/40">
                A infraestrutura definitiva para o ciclo completo do recurso público. 
                IA de ponta, monitoramento ativo de editais e compliance rigoroso — 
                para prefeituras, associações e empresas.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
                  🔒 SSL 256-bit
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
                  🇧🇷 Dados no Brasil
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/80">Plataforma</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-white/40">
                <li><a href="#funcionalidades" className="hover:text-emerald-400 transition-colors">Funcionalidades</a></li>
                <li><a href="#ia" className="hover:text-emerald-400 transition-colors">Inteligência Artificial</a></li>
                <li><a href="#planos" className="hover:text-emerald-400 transition-colors">Planos e Preços</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/80">Legal</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-white/40">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-white/20">
            © {new Date().getFullYear()} Captando. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
