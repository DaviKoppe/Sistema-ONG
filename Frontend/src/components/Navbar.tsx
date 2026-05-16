import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, Menu, Moon, Sun, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import LogoImg from "../../assets/Logo.png";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  username?: string;
}

const Navbar = ({ isLoggedIn = false, onLogout, username }: NavbarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  const linkClass = (path: string) =>
    `block px-3 py-2 rounded text-sm font-semibold transition-colors ${
      location.pathname === path
        ? "bg-primary-foreground/20 text-primary-foreground"
        : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
    }`;

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2">
              <img
                src={LogoImg}
                alt="Amigos do Zé Alguém"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-foreground/30"
              />
            </Link>
            <div className="hidden md:flex flex-wrap items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className={linkClass(item.path)}>
                  {item.label}
                </Link>
              ))}
              {isLoggedIn &&
                loggedInItems.map((item) => (
                  <Link key={item.path} to={item.path} className={linkClass(item.path)}>
                    {item.label}
                  </Link>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Alternar tema"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <span className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-primary-foreground/90 select-none">
                    <User className="w-4 h-4" />
                    {username}
                  </span>
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
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 font-semibold">
                    <LogIn className="w-4 h-4 mr-1" />
                    Fazer Login
                  </Button>
                </Link>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
              aria-label="Abrir menu"
              onClick={() => setIsMobileOpen((v) => !v)}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <div className={`${isMobileOpen ? "block" : "hidden"} md:hidden pb-4`}>
          <div className="space-y-1 border-t border-primary-foreground/10 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={linkClass(item.path)}
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn &&
              loggedInItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={linkClass(item.path)}
                >
                  {item.label}
                </Link>
              ))}
            <div className="border-t border-primary-foreground/10 pt-4">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <span className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary-foreground/90">
                    <User className="w-4 h-4" />
                    {username}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-left text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => {
                      onLogout?.();
                      closeMobileMenu();
                    }}
                  >
                    Sair
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" size="sm" className="w-full text-left text-primary-foreground hover:bg-primary-foreground/10 font-semibold">
                    <LogIn className="w-4 h-4 mr-1" />
                    Fazer Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
