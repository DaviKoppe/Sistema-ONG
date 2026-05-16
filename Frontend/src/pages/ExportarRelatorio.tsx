import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import TabelaTransacoes from "@/components/TabelaTransacoes";
import FiltroTransacoes from "@/components/FiltroTransacoes";
import { ArrowLeft, FileDown, FilterX } from "lucide-react";
import ResumoFinanceiroCards from "@/components/ResumoFinanceiroCards";
import { apiJson } from "@/lib/api";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { gerarRelatorioPdf } from "@/lib/gerarRelatorioPdf";

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida" | "transferencia";
  data: string;
  categoria: string;
  comprovanteUrl?: string | null;
}


const ExportarRelatorio = () => {
  const navigate = useNavigate();
  const filtrosRef = useRef<HTMLDivElement>(null);

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const { data: transacoes = [], isLoading, isError } = useQuery({
    queryKey: ["transacoes"],
    queryFn: async () => {
      const data = await apiJson<{ ok: boolean; results: any[] }>(
        "/api/financeiro/transacoes/",
      );
      return (data.results ?? []).map((t) => ({
        id: String(t.id),
        descricao: String(t.descricao ?? ""),
        valor: Number(t.valor),
        tipo:
          t.tipo === "saída"
            ? "saida"
            : t.tipo === "transferencia"
              ? "transferencia"
              : ("entrada" as const),
        data: String(t.data),
        categoria: String(t.categoria?.nome ?? "Geral"),
        comprovanteUrl: (t.comprovante_url ?? null) as string | null,
      })) as Transacao[];
    },
    retry: false,
  });

  const categorias = useMemo(() => {
    const cats = new Set(transacoes.map((t) => t.categoria));
    return Array.from(cats).sort();
  }, [transacoes]);

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t) => {
      if (busca && !t.descricao.toLowerCase().includes(busca.toLowerCase()))
        return false;
      if (filtroTipo !== "todos" && t.tipo !== filtroTipo) return false;
      if (filtroCategoria !== "todas" && t.categoria !== filtroCategoria)
        return false;
      if (dataInicial && t.data < dataInicial) return false;
      if (dataFinal && t.data > dataFinal) return false;
      return true;
    });
  }, [transacoes, busca, filtroTipo, filtroCategoria, dataInicial, dataFinal]);

  const { totalEntradas, totalSaidas, saldo } = useMemo(() => {
    const entradas = transacoesFiltradas
      .filter((t) => t.tipo === "entrada")
      .reduce((acc, t) => acc + t.valor, 0);
    const saidas = transacoesFiltradas
      .filter((t) => t.tipo === "saida")
      .reduce((acc, t) => acc + t.valor, 0);
    return { totalEntradas: entradas, totalSaidas: saidas, saldo: entradas - saidas };
  }, [transacoesFiltradas]);

  const filtrosAtivos =
    busca || filtroTipo !== "todos" || filtroCategoria !== "todas" || dataInicial || dataFinal;

  const limparFiltros = () => {
    setBusca("");
    setFiltroTipo("todos");
    setFiltroCategoria("todas");
    setDataInicial("");
    setDataFinal("");
  };

  // PDF fe Relatório Financeiro que pode ser filtrado ou não 
  const exportarPDF = () =>
    gerarRelatorioPdf({ transacoes: transacoesFiltradas, totalEntradas, totalSaidas, saldo });

  return (
    <div className="animate-fade-in py-10 px-6">
      <div className="container max-w-5xl mx-auto space-y-8">

        {/* Cabeçalho da página */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/controle-financeiro")}
              className="h-9 w-9 text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                Exportar relatório financeiro
              </h1>
              <p className="text-sm text-muted-foreground">
                Configure os filtros, realize a consulta de transações e exporte o PDF.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={exportarPDF}
            disabled={isLoading || transacoesFiltradas.length === 0}
            className="gap-2 shrink-0"
          >
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Estado de carregamento / erro */}
        {isLoading && (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
            Carregando transações…
          </div>
        )}
        {isError && (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-destructive">
            Erro ao carregar transações. Verifique a conexão e tente novamente.
          </div>
        )}

        {!isLoading && !isError && (
          <>

            {/* Cards de resumo */}
            <ResumoFinanceiroCards totalEntradas={totalEntradas} totalSaidas={totalSaidas} saldo={saldo} />

            {/* Filtros */}
            <div ref={filtrosRef} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Filtros</h2>
              <FiltroTransacoes
                busca={busca}
                onBuscaChange={setBusca}
                tipo={filtroTipo}
                onTipoChange={setFiltroTipo}
                dataInicio={dataInicial}
                onDataInicioChange={setDataInicial}
                dataFim={dataFinal}
                onDataFimChange={setDataFinal}
                categoria={filtroCategoria}
                onCategoriaChange={setFiltroCategoria}
                categoriaOptions={[
                  { value: "todas", label: "Todas as categorias" },
                  ...categorias.map((cat) => ({ value: cat, label: cat })),
                ]}
                filtrosAtivos={!!filtrosAtivos}
                totalFiltrado={transacoesFiltradas.length}
                totalGeral={transacoes.length}
                onLimparFiltros={limparFiltros}
              />
            </div>

            {/* Preview da tabela */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Preview</h2>
                <span className="text-sm text-muted-foreground">
                  {transacoesFiltradas.length}{" "}
                  transaç{transacoesFiltradas.length === 1 ? "ão" : "ões"}{" "}
                  encontrada{transacoesFiltradas.length === 1 ? "" : "s"}
                </span>
              </div>
              <TabelaTransacoes
                transacoes={transacoesFiltradas}
                showCategoria
                showComprovante
                emptyMessage="Nenhuma transação encontrada com os filtros aplicados."
              />
            </div>

            {/* Rodapé de ação */}
            <div className="flex items-center justify-between py-2">
              <Button
                type="button"
                variant="outline"
                onClick={limparFiltros}
                disabled={!filtrosAtivos}
                className="gap-2"
              >
                <FilterX className="w-4 h-4" />
                Limpar filtros
              </Button>
              <Button
                type="button"
                onClick={exportarPDF}
                disabled={transacoesFiltradas.length === 0}
                className="gap-2"
              >
                <FileDown className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </>
        )}
      </div>
      <ScrollToTopButton targetRef={filtrosRef} />
    </div>
  );
};

export default ExportarRelatorio;
