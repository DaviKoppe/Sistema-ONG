import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DateInput from "@/components/ui/DateInput";
import FiltroSelect, { TIPO_OPTIONS, SelectOption } from "@/components/FiltroSelect";
import { cn } from "@/lib/utils";

interface FiltroTransacoesProps {
  busca: string;
  onBuscaChange: (v: string) => void;
  tipo: string;
  onTipoChange: (v: string) => void;
  dataInicio: string;
  onDataInicioChange: (v: string) => void;
  dataFim: string;
  onDataFimChange: (v: string) => void;
  categoria?: string;
  onCategoriaChange?: (v: string) => void;
  categoriaOptions?: SelectOption[];
  filtrosAtivos: boolean;
  totalFiltrado?: number;
  totalGeral?: number;
  isLoading?: boolean;
  onLimparFiltros: () => void;
  className?: string;
}

const FiltroTransacoes = ({
  busca, onBuscaChange,
  tipo, onTipoChange,
  dataInicio, onDataInicioChange,
  dataFim, onDataFimChange,
  categoria, onCategoriaChange, categoriaOptions,
  filtrosAtivos, totalFiltrado, totalGeral, isLoading = false,
  onLimparFiltros, className,
}: FiltroTransacoesProps) => {
  const showCategoria = categoria !== undefined;

  let contagem: string | null = null;
  if (isLoading) {
    contagem = "Carregando...";
  } else if (totalFiltrado !== undefined) {
    const n = totalFiltrado;
    const sufixo = n === 1 ? "ão" : "ões";
    const fem = n === 1 ? "" : "s";
    if (filtrosAtivos && totalGeral !== undefined) {
      contagem = `Exibindo ${n} de ${totalGeral} transaç${sufixo}`;
    } else if (filtrosAtivos) {
      contagem = `${n} transaç${sufixo} encontrada${fem}`;
    } else {
      contagem = `${n} transaç${sufixo} no total`;
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por descrição..."
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {busca && (
          <button
            type="button"
            onClick={() => onBuscaChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid de filtros */}
      <div
        className={cn(
          "grid gap-3",
          showCategoria
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-3",
        )}
      >
        <FiltroSelect
          label="Tipo de transação"
          value={tipo}
          onValueChange={onTipoChange}
          options={TIPO_OPTIONS}
        />
        {showCategoria && (
          <FiltroSelect
            label="Categoria"
            value={categoria}
            onValueChange={onCategoriaChange!}
            options={categoriaOptions ?? []}
            scrollable
          />
        )}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Data inicial</label>
          <DateInput value={dataInicio} onChange={onDataInicioChange} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Data final</label>
          <DateInput value={dataFim} onChange={onDataFimChange} />
        </div>
      </div>

      {/* Rodapé: contagem + limpar */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">{contagem}</span>
        {filtrosAtivos && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLimparFiltros}
            className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default FiltroTransacoes;
