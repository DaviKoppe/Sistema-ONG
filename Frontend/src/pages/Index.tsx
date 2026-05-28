import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, HandHeart, Copy, Check, ExternalLink } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


import imgCarousel1 from "@/assets/carousel/imagem-ong-01.jpg";
import imgCarousel2 from "@/assets/carousel/imagem-ong-02.jpg";
import imgCarousel3 from "@/assets/carousel/imagem-ong-03.jpg";
import imgCarousel4 from "@/assets/carousel/imagem-ong-04.jpg";
import imgCarousel5 from "@/assets/carousel/imagem-ong-05.jpg";
import imgCarousel6 from "@/assets/carousel/imagem-ong-06.jpg";
import imgCarousel7 from "@/assets/carousel/imagem-ong-07.jpg";
import imgCarousel8 from "@/assets/carousel/imagem-ong-08.jpg";
import imgCarousel9 from "@/assets/carousel/imagem-ong-09.jpg";

const PIX_KEY = "48.503.587/0001-88";
const CAROUSEL_IMAGES = [imgCarousel1, imgCarousel2, imgCarousel3, imgCarousel4, imgCarousel5, imgCarousel6, imgCarousel7, imgCarousel8, imgCarousel9];

const Index = () => {
  const [copied, setCopied] = useState(false);

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      {}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-2 items-center">
          {}
          <div className="px-0 sm:px-4 md:px-10">
            <Carousel className="w-full" opts={{ loop: true }}>
              <CarouselContent>
                {CAROUSEL_IMAGES.map((image, i) => (
                  <CarouselItem key={i}>
                    <img
                      src={image}
                      alt={`Foto da ONG ${i + 1}`}
                      className="w-full rounded-lg aspect-[5/4] object-cover min-h-[240px]"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {/* Texto */}
          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-foreground leading-tight sm:text-4xl">
              Amigos do Zé Alguém
            </h1>
            <p className="text-muted-foreground leading-relaxed text-justify sm:text-left">
              A ONG Amigos do Zé Alguém realiza atividades sociais voltadas ao apoio de pessoas em
              situação de vulnerabilidade. Este sistema permite acompanhar de forma transparente as
              movimentações financeiras da organização, possibilitando o acesso aos extratos e
              informações das transações feitas pela ONG.
            </p>
            <Link to="/prestacao-de-contas">
              <Button size="lg" className="mt-4 sm:mt-6 w-full md:w-auto">
                Ver mais informações
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info cards */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

      {/* CTA — Doação / Voluntariado */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-primary/5 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">Faça parte desta história</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm text-justify md:text-center">
              Sua contribuição, seja em tempo ou recursos, transforma vidas. Conheça as formas de apoiar a nossa causa.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Voluntariado e doação de cesta básica */}
            <div className="bg-card border border-border rounded-xl p-6 sm:p-7 flex flex-col gap-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Voluntariado & Doações</h3>
                  <p className="text-sm text-muted-foreground mt-1 text-justify">
                    Participe como voluntário ou contribua com doações de cesta básica e outros
                    itens essenciais para quem mais precisa.
                  </p>
                </div>
              </div>
              <a
                href="https://linklist.bio/amigosdozealguem?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPNTY3MDY3MzQzMzUyNDI3AAGnA12UzrY-Inf3VS0qNVzVwzOkqGX5uXB5lQJWGolqorQNsXxK1PXkp7iRdGQ_aem_PV0mmbeUpPqG4NXdPy7n0A"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Quero ajudar
                </Button>
              </a>
            </div>

            {/* PIX */}
            <div className="bg-card border border-border rounded-xl p-6 sm:p-7 flex flex-col gap-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <HandHeart className="w-6 h-6 text-primary" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Doação via PIX</h3>
                  <p className="text-sm text-muted-foreground mt-1 text-justify">
                    Doe qualquer valor diretamente pelo PIX e ajude a ONG a continuar realizando
                    seu trabalho social.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-muted rounded-lg px-4 py-3 border border-border">
                <span className="flex-1 text-sm font-mono font-semibold text-foreground select-all break-all">
                  {PIX_KEY}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={copyPix}
                  className="h-8 w-8 shrink-0"
                  title="Copiar chave PIX"
                >
                  {copied
                    ? <Check className="w-4 h-4 text-green-600" />
                    : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
