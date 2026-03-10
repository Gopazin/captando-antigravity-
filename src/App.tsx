import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Cofre from "./pages/Cofre";
import Editais from "./pages/Editais";
import Projetos from "./pages/Projetos";
import Assistente from "./pages/Assistente";
import GestaoCompliance from "./pages/GestaoCompliance";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/cofre" element={<Cofre />} />
            <Route path="/editais" element={<Editais />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/assistente" element={<Assistente />} />
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