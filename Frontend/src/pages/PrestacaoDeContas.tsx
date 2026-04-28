import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const categorias = [
  { id: "1", nome: "Categoria 01", descricao: "Transações relacionadas à categoria 01." },
  { id: "2", nome: "Categoria 02", descricao: "Transações relacionadas à categoria 02." },
  { id: "3", nome: "Categoria 03", descricao: "Transações relacionadas à categoria 03." },
];

const PrestacaoDeContas = () => {
  return (
    <div className="animate-fade-in py-12 px-6">
      <div className="container max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-primary hover:underline text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground text-center mb-10">
          Prestação de contas
        </h1>
        <Accordion type="single" collapsible className="space-y-3">
          {categorias.map((cat) => (
            <AccordionItem key={cat.id} value={cat.id} className="bg-card border border-border rounded-lg px-4">
              <AccordionTrigger className="font-semibold text-foreground hover:no-underline">
                {cat.nome}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {cat.descricao}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default PrestacaoDeContas;
