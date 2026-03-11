import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Cofre from "./pages/Cofre";
import Editais from "./pages/Editais";
import Assistente from "./pages/Assistente";
import EscritorioKanban from "./pages/EscritorioKanban";
import GestaoProjetosOverview from "./pages/GestaoProjetosOverview";
import GestaoProjetoDetalhe from "./pages/GestaoProjetoDetalhe";
import GestaoCompliance from "./pages/GestaoCompliance";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/cofre" element={<Cofre />} />
            <Route path="/editais" element={<Editais />} />
            {/* Escritório de Projetos */}
            <Route path="/escritorio/assistente" element={<Assistente />} />
            <Route path="/escritorio/kanban" element={<EscritorioKanban />} />
            {/* Gestão de Projetos */}
            <Route path="/gestao-projetos" element={<GestaoProjetosOverview />} />
            <Route path="/gestao-projetos/cronograma" element={<GestaoProjetosOverview />} />
            <Route path="/gestao-projetos/documentos" element={<GestaoProjetosOverview />} />
            <Route path="/gestao-projetos/:projectId" element={<GestaoProjetoDetalhe />} />
            {/* Legacy redirects */}
            <Route path="/assistente" element={<Navigate to="/escritorio/assistente" replace />} />
            <Route path="/projetos" element={<Navigate to="/escritorio/kanban" replace />} />
            {/* Other */}
            <Route path="/gestao" element={<GestaoCompliance />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
