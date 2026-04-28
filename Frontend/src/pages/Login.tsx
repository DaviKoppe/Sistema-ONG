import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiJson } from "@/lib/api";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await apiJson("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password: senha }),
    });

    onLogin();
    navigate("/controle-financeiro");
  };

  return (
    <div className="animate-fade-in flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-sm space-y-8">
        <h1 className="text-3xl font-extrabold text-center text-primary">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Logar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
