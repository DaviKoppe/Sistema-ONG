import { Mail, Phone, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="text-center space-y-3">
          <p className="font-semibold text-sm">Nos acompanhe nas redes sociais</p>
          <div className="flex items-center justify-center gap-3">
            <a href="#" className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-primary-foreground/80">
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp</span>
          </div>
          <p className="text-xs text-primary-foreground/60">Amigos do Zé Alguém © 2026</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
