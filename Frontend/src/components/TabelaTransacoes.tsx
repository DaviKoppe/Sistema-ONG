import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TransacaoRow {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  data: string;
  categoria?: string;
  comprovanteUrl?: string | null;
}

interface TabelaTransacoesProps {
  transacoes: TransacaoRow[];
  showCategoria?: boolean;
  showComprovante?: boolean;
  showAcoes?: boolean;
  onEdit?: (t: TransacaoRow) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatData = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const normalizaTipo = (tipo: string) => {
  if (tipo === "saída" || tipo === "saida") return "saida";
  if (tipo === "transferencia" || tipo === "transferência") return "transferencia";
  return "entrada";
};

const TIPO_LABELS: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
  transferencia: "Transferência",
};

const TIPO_COLORS: Record<string, string> = {
  entrada: "text-green-700 bg-green-50 border-green-200",
  saida: "text-red-700 bg-red-50 border-red-200",
  transferencia: "text-blue-700 bg-blue-50 border-blue-200",
};

const TabelaTransacoes = ({
  transacoes,
  showCategoria = false,
  showComprovante = false,
  showAcoes = false,
  onEdit,
  onDelete,
  emptyMessage = "Nenhuma transação encontrada.", 
}: TabelaTransacoesProps) => {

  const colSpan =
    4 +
    (showCategoria ? 1 : 0) +
    (showComprovante ? 1 : 0) +
    (showAcoes ? 1 : 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Data</TableHead>
          {showCategoria && <TableHead>Categoria</TableHead>}
          {showComprovante && <TableHead>Comprovante</TableHead>}
          {showAcoes && <TableHead className="text-right">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transacoes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="text-center text-sm text-muted-foreground py-10">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          transacoes.map((t) => {
            const tipo = normalizaTipo(t.tipo);
            return (
              <TableRow key={t.id}>
                <TableCell>{t.descricao}</TableCell>
                <TableCell className={cn(
                  "font-semibold whitespace-nowrap",
                  tipo === "entrada" ? "text-green-600" : "text-red-600",
                )}>
                  {tipo === "entrada" ? "+" : "−"} {formatCurrency(t.valor)}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full border",
                    TIPO_COLORS[tipo] ?? "text-muted-foreground bg-muted border-border",
                  )}>
                    {TIPO_LABELS[tipo] ?? t.tipo}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatData(t.data)}
                </TableCell>
                {showCategoria && (
                  <TableCell className="text-muted-foreground">{t.categoria}</TableCell>
                )}
                {showComprovante && (
                  <TableCell>
                    {t.comprovanteUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2 text-xs border"
                        onClick={() => window.open(t.comprovanteUrl!, "_blank", "noopener,noreferrer")}
                      >
                        Ver comprovante
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem comprovante</span>
                    )}
                  </TableCell>
                )}
                {showAcoes && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="group h-8 w-8 hover:bg-primary"
                          onClick={() => onEdit(t)}
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-white" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDelete(t.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default TabelaTransacoes;
