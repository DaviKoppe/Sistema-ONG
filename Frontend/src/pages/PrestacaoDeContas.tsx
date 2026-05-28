import { useRef, useState, useMemo } from "react";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import TabelaTransacoes from "@/components/TabelaTransacoes";
import FiltroTransacoes from "@/components/FiltroTransacoes";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { cn } from "@/lib/utils";

interface TransacaoPublica {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  data: string;
  comprovanteUrl: string | null;
}

interface CategoriaAgrupada {
  id: string;
  nome: string;
  transacoes: TransacaoPublica[];
}

const normalizaTipo = (tipo: string) => {
  if (tipo === "saída" || tipo === "saida") return "saida";
  if (tipo === "transferencia" || tipo === "transferência") return "transferencia";
  return "entrada";
};

const PrestacaoDeContas = () => {
  const navigate = useNavigate();
  const itemRefs     = useRef<Map<string, HTMLDivElement>>(new Map());
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const [openValue, setOpenValue] = useState<string>("");

  
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [busca,        setBusca]        = useState("");
  const [tipoFiltro,   setTipoFiltro]   = useState("todos");
  const [dataInicio,   setDataInicio]   = useState("");
  const [dataFim,      setDataFim]      = useState("");

  const temFiltroAtivo = busca !== "" || tipoFiltro !== "todos" || dataInicio !== "" || dataFim !== "";

  const limparFiltros = () => {
    setBusca("");
    setTipoFiltro("todos");
    setDataInicio("");
    setDataFim("");
  };

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
        const catId   = String(t.categoria?.id   ?? "sem-categoria");
        const catNome = t.categoria?.nome ?? "Sem categoria";

        if (!grouped.has(catId)) {
          grouped.set(catId, { id: catId, nome: catNome, transacoes: [] });
        }

        grouped.get(catId)!.transacoes.push({
          id: String(t.id),
          descricao: String(t.descricao ?? ""),
          valor: Number(t.valor),
          tipo:  String(t.tipo ?? "entrada"),
          data: String(t.data),
          comprovanteUrl: t.comprovante_url ?? null,
        });
      }

      return Array.from(grouped.values()).sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      );
    },
    retry: false,
  });

  const categoriasFiltradas = useMemo(() => {
    if (!categorias) return [];
    return categorias
      .map((cat) => ({
        ...cat,
        transacoes: cat.transacoes.filter((t) => {
          const matchBusca = !busca || t.descricao.toLowerCase().includes(busca.toLowerCase());
          const matchTipo   = tipoFiltro === "todos" || normalizaTipo(t.tipo) === tipoFiltro;
          const matchInicio = !dataInicio || t.data >= dataInicio;
          const matchFim    = !dataFim    || t.data <= dataFim;
          return matchBusca && matchTipo && matchInicio && matchFim;
        }),
      }))
      .filter((cat) => cat.transacoes.length > 0);
  }, [categorias, busca, tipoFiltro, dataInicio, dataFim]);

  const totalTransacoes = categoriasFiltradas.reduce((acc, c) => acc + c.transacoes.length, 0);

  return (
    <div className="animate-fade-in py-10 px-6">
      <div className="container max-w-4xl mx-auto space-y-6">

        {}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/")} className="h-9 w-9 text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Prestação de contas</h1>
              <p className="text-sm text-muted-foreground">Transparência das movimentações financeiras da organização.</p>
            </div>
          </div>
          <Button
            type="button"
            variant={filtroAberto ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroAberto((v) => !v)}
            className="gap-2 shrink-0 transition-colors"
          >
            <SlidersHorizontal
              className={cn("w-4 h-4 transition-transform duration-300", filtroAberto && "rotate-180")}
            />
            {filtroAberto ? "Desabilitar filtros" : "Habilitar filtros"}
          </Button>
        </div>

        {}
        {filtroAberto && (
          <FiltroTransacoes
            busca={busca}
            onBuscaChange={setBusca}
            tipo={tipoFiltro}
            onTipoChange={setTipoFiltro}
            dataInicio={dataInicio}
            onDataInicioChange={setDataInicio}
            dataFim={dataFim}
            onDataFimChange={setDataFim}
            filtrosAtivos={temFiltroAtivo}
            totalFiltrado={totalTransacoes}
            isLoading={isLoading}
            onLimparFiltros={limparFiltros}
            className="bg-card border border-border rounded-xl p-5 shadow-sm animate-fade-in"
          />
        )}

        {}
        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">Carregando...</p>
        ) : isError ? (
          <p className="text-center text-destructive py-10">Erro ao carregar dados.</p>
        ) : categoriasFiltradas.length === 0 ? (
          <div className="text-center py-14 space-y-2">
            <p className="text-muted-foreground font-medium">Nenhuma transação encontrada.</p>
            {temFiltroAtivo && (
              <Button type="button" variant="outline" size="sm" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={openValue}
            onValueChange={handleValueChange}
            className="space-y-3"
          >
            {categoriasFiltradas.map((cat) => (
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
                    <TabelaTransacoes transacoes={cat.transacoes} showComprovante />
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
