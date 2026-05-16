import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
}

interface FiltroSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  scrollable?: boolean;
}

const FiltroSelect = ({
  label,
  value,
  onValueChange,
  options,
  scrollable = false,
}: FiltroSelectProps) => (

  <div className="space-y-1.5">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={scrollable ? "max-h-[200px] overflow-y-auto" : undefined}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  
);

export const TIPO_OPTIONS: SelectOption[] = [
  { value: "todos", label: "Todos os tipos" },
  { value: "entrada", label: "Entrada" },
  { value: "saida", label: "Saída" },
  { value: "transferencia", label: "Transferência" },
];

export default FiltroSelect;
