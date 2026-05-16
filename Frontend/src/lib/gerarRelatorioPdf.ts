import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Transacao {
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

interface GerarRelatorioPdfParams {
  transacoes: Transacao[];
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

export function gerarRelatorioPdf({
  transacoes,
  totalEntradas,
  totalSaidas,
  saldo,
}: GerarRelatorioPdfParams): void {
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
    body: transacoes.map((t) => [
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
      0: { cellWidth: 38 },
      1: { cellWidth: 32 },
      2: { cellWidth: 28 },
      3: { cellWidth: 35 },
      4: { cellWidth: 27 },
      5: { cellWidth: 28 },
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
    `${transacoes.length} transaç${transacoes.length === 1 ? "ão" : "ões"} exportada${transacoes.length === 1 ? "" : "s"} · Amigos do Zé Alguém · ${dataExportacao}`,
    14,
    finalY + 8,
  );

  doc.save("relatorio-financeiro.pdf");
}
