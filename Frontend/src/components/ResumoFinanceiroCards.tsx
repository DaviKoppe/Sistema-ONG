import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumoFinanceiroCardsProps {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ResumoFinanceiroCards = ({ totalEntradas, totalSaidas, saldo }: ResumoFinanceiroCardsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
        <TrendingUp className="w-5 h-5 text-success" />
      </span>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Total Entradas</p>
        <p className="text-xl font-bold text-success">{formatCurrency(totalEntradas)}</p>
      </div>
    </div>

    <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
        <TrendingDown className="w-5 h-5 text-destructive" />
      </span>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Total Saídas</p>
        <p className="text-xl font-bold text-destructive">{formatCurrency(totalSaidas)}</p>
      </div>
    </div>

    <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
      <span className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        saldo >= 0 ? "bg-primary/10" : "bg-destructive/10",
      )}>
        <Wallet className={cn("w-5 h-5", saldo >= 0 ? "text-primary" : "text-destructive")} />
      </span>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Saldo Final</p>
        <p className={cn("text-xl font-bold", saldo >= 0 ? "text-primary" : "text-destructive")}>
          {formatCurrency(saldo)}
        </p>
      </div>
    </div>
  </div>
);

export default ResumoFinanceiroCards;
