import { Link, useLocation } from "react-router-dom";
import { Heart, LogIn, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  username?: string;
}

const Navbar = ({ isLoggedIn = false, onLogout, username }: NavbarProps) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: "TELA INICIAL", path: "/" },
    { label: "PRESTAÇÃO DE CONTAS", path: "/prestacao-de-contas" },
  ];

  const loggedInItems = [
    { label: "PAINEL DE CONTROLE FINANCEIRO", path: "/controle-financeiro" },
    { label: "EXPORTAR - CONSULTA", path: "/exportar-relatorio" },
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
            loggedInItems.map((item) => (
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
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <span className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-primary-foreground/90 select-none">
              <User className="w-4 h-4" />
              {username}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Alternar tema"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={onLogout}
            >
              Sair
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Alternar tema"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 font-semibold">
                <LogIn className="w-4 h-4 mr-1" />
                Fazer Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
