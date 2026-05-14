import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import PrestacaoDeContas from "./pages/PrestacaoDeContas";
import Login from "./pages/Login";
import ControleFinanceiro from "./pages/ControleFinanceiro";
import ExportarRelatorio from "./pages/ExportarRelatorio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const handleLogin = (name: string) => {
    setIsLoggedIn(true);
    setUsername(name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout isLoggedIn={isLoggedIn} onLogout={handleLogout} username={username}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/prestacao-de-contas" element={<PrestacaoDeContas />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/controle-financeiro" element={<ControleFinanceiro />} />
                <Route path="/exportar-relatorio" element={<ExportarRelatorio />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
