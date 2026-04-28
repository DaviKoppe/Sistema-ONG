import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Layout = ({ children, isLoggedIn, onLogout }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
