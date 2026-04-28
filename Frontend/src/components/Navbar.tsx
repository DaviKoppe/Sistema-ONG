import { Link, useLocation } from "react-router-dom";
import { Heart, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Navbar = ({ isLoggedIn = false, onLogout }: NavbarProps) => {
  const location = useLocation();

  const navItems = [
    { label: "TELA INICIAL", path: "/" },
    { label: "VISUALIZAÇÃO PÚBLICA", path: "/prestacao-de-contas" },
  ];

  const loggedInItems = [
    { label: "PAINEL DE CONTROLE FINANCEIRO", path: "/controle-financeiro" },
    { label: "EXPORTAR", path: "/controle-financeiro" },
    { label: "RELATÓRIOS", path: "/controle-financeiro" },
  ];

  return (
    <nav className="h-16 bg-primary flex items-center px-6 justify-between shadow-md">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                location.pathname === item.path
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn &&
            loggedInItems.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                  location.pathname === item.path && i === 0
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <Link to="/meu-perfil">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <User className="w-4 h-4 mr-1" />
                MEU PERFIL
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={onLogout}>
              Sair
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 font-semibold">
              <LogIn className="w-4 h-4 mr-1" />
              Fazer Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
