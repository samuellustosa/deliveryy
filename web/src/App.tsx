// web/src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "./layouts/AppLayout"; // Certifique-se de criar este arquivo
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import PublicMenu from "./pages/PublicMenu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      <BrowserRouter>
        <Routes>
          {/* Rotas Externas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Rotas Internas (COM Menu Lateral) */}
          <Route path="/" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* AGORA O MENU 'PRODUTOS' VAI ABRIR O SEU PAINEL DE GESTÃO */}
            <Route path="products" element={<AdminPanel />} />
            
            {/* Mantenha o admin/:id se ainda precisar dele, mas o 'products' é o que o menu usa */}
            <Route path="admin/:id" element={<AdminPanel />} />
            
            <Route path="categories" element={<div>Página de Categorias (Em construção)</div>} />
            
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="/m/:slug" element={<PublicMenu />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);