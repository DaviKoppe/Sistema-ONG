import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  FileDown,
  FilterX,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { apiJson } from "@/lib/api";
import { cn } from "@/lib/utils";
import ScrollToTopButton from "@/components/ScrollToTopButton";

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida" | "transferencia";
  data: string;
  categoria: string;
  comprovanteUrl?: string | null;
}

const TIPO_LABELS: Record<Transacao["tipo"], string> = {
  entrada: "Entrada",
  saida: "Saída",
  transferencia: "Transferência",
};

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

function TipoBadge({ tipo }: { tipo: Transacao["tipo"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
        tipo === "entrada" && "bg-success/10 text-success",
        tipo === "saida" && "bg-destructive/10 text-destructive",
        tipo === "transferencia" && "bg-primary/10 text-primary",
      )}
    >
      {TIPO_LABELS[tipo]}
    </span>
  );
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

  // ============== ESTRUTURA DO PDF ============== //
  const exportarPDF = () => {
    const doc = new jsPDF();
    const agora = new Date();
    const dataExportacao = agora.toLocaleDateString("pt-BR");
    const horaExportacao = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Cabeçalho azul
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 42, "F");

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Amigos do Zé Alguém", 14, 18);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório Financeiro", 14, 27);

    doc.setFontSize(8);
    doc.setTextColor(219, 234, 254);
    doc.text(`Exportado em ${dataExportacao} às ${horaExportacao}`, 14, 35);

    // Separador
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, 50, 196, 50);

    // Título do resumo
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Resumo do período", 14, 58);

    // Cards de resumo
    const summaryY = 65;
    const cardW = 57;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, summaryY, cardW, 20, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("TOTAL ENTRADAS", 14 + cardW / 2, summaryY + 7, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text(formatCurrency(totalEntradas), 14 + cardW / 2, summaryY + 15, { align: "center" });

    const card2X = 14 + cardW + 5;
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(card2X, summaryY, cardW, 20, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("TOTAL SAÍDAS", card2X + cardW / 2, summaryY + 7, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(formatCurrency(totalSaidas), card2X + cardW / 2, summaryY + 15, { align: "center" });

    const card3X = card2X + cardW + 5;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(card3X, summaryY, cardW, 20, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("SALDO FINAL", card3X + cardW / 2, summaryY + 7, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      saldo >= 0 ? 37 : 220,
      saldo >= 0 ? 99 : 38,
      saldo >= 0 ? 235 : 38,
    );
    doc.text(formatCurrency(saldo), card3X + cardW / 2, summaryY + 15, { align: "center" });

    // Tabela de transações
    autoTable(doc, {
      startY: summaryY + 28,
      head: [["Descrição", "Categoria", "Tipo", "Valor (R$)", "Data", "Comprovante"]],
      body: transacoesFiltradas.map((t) => [
        t.descricao,
        t.categoria,
        TIPO_LABELS[t.tipo],
        (t.tipo === "entrada" ? "+ " : "- ") + formatCurrency(t.valor),
        formatDate(t.data),
        t.comprovanteUrl ? "Sim" : "Não",
      ]),
      styles: {
        fontSize: 8.5,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        textColor: [40, 40, 40],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 48 },
        1: { cellWidth: 32 },
        2: { cellWidth: 25 },
        3: { cellWidth: 38 },
        4: { cellWidth: 22 },
        5: { cellWidth: 22 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          const val = String(data.cell.raw);
          if (val.startsWith("+ ")) {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          } else if (val.startsWith("- ")) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    const finalY: number = (doc as any).lastAutoTable?.finalY ?? 200;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130, 130, 130);
    doc.text(
      `${transacoesFiltradas.length} transaç${transacoesFiltradas.length === 1 ? "ão" : "ões"} exportada${transacoesFiltradas.length === 1 ? "" : "s"} · Amigos do Zé Alguém · ${dataExportacao}`,
      14,
      finalY + 8,
    );

    doc.save("relatorio-financeiro.pdf");
  };
  // ================================================== //

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
              onClick={() => navigate(-1)}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    Total Entradas
                  </p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(totalEntradas)}
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    Total Saídas
                  </p>
                  <p className="text-xl font-bold text-destructive">
                    {formatCurrency(totalSaidas)}
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
                <span
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    saldo >= 0 ? "bg-primary/10" : "bg-destructive/10",
                  )}
                >
                  <Wallet
                    className={cn(
                      "w-5 h-5",
                      saldo >= 0 ? "text-primary" : "text-destructive",
                    )}
                  />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    Saldo Final
                  </p>
                  <p
                    className={cn(
                      "text-xl font-bold",
                      saldo >= 0 ? "text-primary" : "text-destructive",
                    )}
                  >
                    {formatCurrency(saldo)}
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div ref={filtrosRef} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Filtros</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Descrição
                  </p>
                  <Input
                    placeholder="Buscar por descrição..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tipo
                  </p>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Categoria
                  </p>
                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      <SelectItem value="todas">Todas as categorias</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Data inicial
                  </p>
                  <Input
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Data final
                  </p>
                  <Input
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <p className="text-xs font-semibold uppercase tracking-wide invisible">
                    placeholder
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={limparFiltros}
                    disabled={!filtrosAtivos}
                    className={cn(
                      "w-full gap-2 transition-colors",
                      filtrosAtivos
                        ? "border-primary text-primary hover:bg-primary/30 hover:text-primary"
                        : "border-primary/40 text-primary/40 cursor-not-allowed",
                    )}
                  >
                    <FilterX className="w-4 h-4" />
                    Limpar filtros
                  </Button>
                </div>
              </div>

              {filtrosAtivos && (
                <p className="text-xs text-muted-foreground">
                  Filtros ativos — exibindo{" "}
                  <span className="font-semibold text-foreground">
                    {transacoesFiltradas.length}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-foreground">{transacoes.length}</span>{" "}
                  transações.
                </p>
              )}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Comprovante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacoesFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-sm text-muted-foreground py-10"
                      >
                        Nenhuma transação encontrada com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transacoesFiltradas.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.descricao}</TableCell>
                        <TableCell className="text-muted-foreground">{t.categoria}</TableCell>
                        <TableCell>
                          <TipoBadge tipo={t.tipo} />
                        </TableCell>
                        <TableCell
                          className={cn(
                            "font-semibold whitespace-nowrap",
                            t.tipo === "entrada" ? "text-success" : "text-destructive",
                          )}
                        >
                          {t.tipo === "entrada" ? "+ " : "- "}
                          {formatCurrency(t.valor)}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {formatDate(t.data)}
                        </TableCell>
                        <TableCell>
                          {t.comprovanteUrl ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
                              Sim
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                              Não
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
