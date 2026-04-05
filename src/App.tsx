import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { Loader2 } from "lucide-react";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Cofre from "./pages/Cofre";
import Editais from "./pages/Editais";
import Assistente from "./pages/Assistente";
import EscritorioKanban from "./pages/EscritorioKanban";
import GestaoProjetosOverview from "./pages/GestaoProjetosOverview";
import GestaoProjetoDetalhe from "./pages/GestaoProjetoDetalhe";
import GestaoCompliance from "./pages/GestaoCompliance";
import Configuracoes from "./pages/Configuracoes";
import MasterAdmin from "./pages/MasterAdmin";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Index />} />
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
              {/* Super Admin */}
              <Route path="/admin-master" element={<MasterAdmin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
