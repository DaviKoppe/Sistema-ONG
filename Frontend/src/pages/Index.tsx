import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, HandHeart } from "lucide-react";

const Index = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-16 px-6">
        <div className="container max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-muted rounded-lg aspect-[4/3] flex items-center justify-center">
            <div className="text-center space-y-3 text-muted-foreground">
              <Heart className="w-16 h-16 mx-auto" />
              <p className="text-sm font-semibold">Imagens da ONG</p>
            </div>
          </div>
          <div className="space-y-5">
            <h1 className="text-3xl font-extrabold text-foreground leading-tight">
              Amigos do Zé Alguém
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              A ONG Amigos do Zé Alguém realiza atividades sociais voltadas ao apoio de pessoas em situação de vulnerabilidade. 
              Este sistema permite acompanhar de forma transparente as movimentações financeiras da organização, 
              possibilitando o acesso aos extratos e informações das transações feitas pela ONG.
            </p>
            <Link to="/prestacao-de-contas">
              <Button size="lg" className="mt-2">
                Ver mais informações
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info cards */}
      <section className="pb-16 px-6">
        <div className="container max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: "Transparência", desc: "Prestação de contas acessível a todos os interessados." },
            { icon: Users, title: "Comunidade", desc: "Apoio a pessoas em situação de vulnerabilidade social." },
            { icon: HandHeart, title: "Solidariedade", desc: "Cada doação faz a diferença na vida de alguém." },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-lg p-6 shadow-sm border border-border text-center space-y-3">
              <item.icon className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
