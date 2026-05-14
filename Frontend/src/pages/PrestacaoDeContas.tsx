import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import ScrollToTopButton from "@/components/ScrollToTopButton";

interface TransacaoPublica {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  data: string;
  comprovante_url: string | null;
}

interface CategoriaAgrupada {
  id: string;
  nome: string;
  transacoes: TransacaoPublica[];
}

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatTipo = (tipo: string) => {
  if (tipo === "saída" || tipo === "saida") return "Saída";
  if (tipo === "transferencia" || tipo === "transferência") return "Transferência";
  return "Entrada";
};

const formatData = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const PrestacaoDeContas = () => {
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const [openValue, setOpenValue] = useState<string>("");

  const handleValueChange = (value: string) => {
    setOpenValue(value);
    activeItemRef.current = value ? (itemRefs.current.get(value) ?? null) : null;
  };

  const { data: categorias, isLoading, isError } = useQuery({
    queryKey: ["prestacao-contas"],
    queryFn: async () => {
      const res = await apiJson<{ ok: boolean; results: any[] }>("/api/financeiro/transacoes/");
      const grouped = new Map<string, CategoriaAgrupada>();

      for (const t of res.results ?? []) {
        const catId = String(t.categoria?.id ?? "sem-categoria");
        const catNome = t.categoria?.nome ?? "Sem categoria";

        if (!grouped.has(catId)) {
          grouped.set(catId, { id: catId, nome: catNome, transacoes: [] });
        }

        grouped.get(catId)!.transacoes.push({
          id: String(t.id),
          descricao: String(t.descricao ?? ""),
          valor: Number(t.valor),
          tipo: String(t.tipo ?? "entrada"),
          data: String(t.data),
          comprovante_url: t.comprovante_url ?? null,
        });
      }

      return Array.from(grouped.values()).sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      );
    },
    retry: false,
  });

  return (
    <div className="animate-fade-in py-12 px-6">
      <div className="container max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-primary hover:underline text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <h1 className="text-3xl font-extrabold text-foreground text-center mb-10">
          Prestação de contas
        </h1>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : isError ? (
          <p className="text-center text-destructive">Erro ao carregar dados.</p>
        ) : categorias?.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhuma transação cadastrada.</p>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={openValue}
            onValueChange={handleValueChange}
            className="space-y-3"
          >
            {categorias?.map((cat) => (
              <div
                key={cat.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(cat.id, el);
                  else itemRefs.current.delete(cat.id);
                }}
              >
                <AccordionItem
                  value={cat.id}
                  className="bg-card border border-border rounded-lg px-4"
                >
                  <AccordionTrigger className="font-semibold text-foreground hover:no-underline">
                    <span className="flex items-center gap-3">
                      {cat.nome}
                      <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {cat.transacoes.length} transaç{cat.transacoes.length === 1 ? "ão" : "ões"}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Comprovante</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.transacoes.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{t.descricao}</TableCell>
                            <TableCell
                              className={
                                t.tipo === "entrada"
                                  ? "text-success font-semibold"
                                  : "text-destructive font-semibold"
                              }
                            >
                              {t.tipo === "entrada" ? "+" : "−"} {formatCurrency(t.valor)}
                            </TableCell>
                            <TableCell>{formatTipo(t.tipo)}</TableCell>
                            <TableCell>{formatData(t.data)}</TableCell>
                            <TableCell>
                              {t.comprovante_url ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-8 px-2 text-xs border"
                                  onClick={() =>
                                    window.open(t.comprovante_url!, "_blank", "noopener,noreferrer")
                                  }
                                >
                                  Ver comprovante
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sem Comprovante</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        )}
      </div>

      <ScrollToTopButton targetRef={activeItemRef} />
    </div>
  );
};

export default PrestacaoDeContas;
