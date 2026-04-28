import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import PrestacaoDeContas from "./pages/PrestacaoDeContas";
import Login from "./pages/Login";
import ControleFinanceiro from "./pages/ControleFinanceiro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout isLoggedIn={isLoggedIn} onLogout={() => setIsLoggedIn(false)}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/prestacao-de-contas" element={<PrestacaoDeContas />} />
              <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
              <Route path="/controle-financeiro" element={<ControleFinanceiro />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
