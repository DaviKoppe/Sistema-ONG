import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  username?: string;
}

const Layout = ({ children, isLoggedIn, onLogout, username }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} username={username} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
