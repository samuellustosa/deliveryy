// web/src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Importação das páginas movidas para a pasta src/pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import PublicMenu from "./pages/PublicMenu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Componentes de feedback visual (Toasts) */}
      <Toaster />
      <Sonner />
      
      <BrowserRouter>
        <Routes>
          {/* Landing page do sistema SaaS */}
          <Route path="/" element={<Landing />} />
          
          {/* Rotas de Autenticação integradas ao seu Backend Node */}
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          
          {/* Rotas Administrativas do Lojista */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/:id" element={<AdminPanel />} />
          
          {/* Rota Multi-tenant: o :slug identifica a loja no banco Neon. 
            Ex: localhost:5173/m/samuel-burger 
          */}
          <Route path="/m/:slug" element={<PublicMenu />} />
          
          {/* Rota padrão para erros 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;