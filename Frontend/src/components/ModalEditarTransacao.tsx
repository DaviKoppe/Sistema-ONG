import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateInput from "@/components/ui/DateInput";
import { X } from "lucide-react";

interface CategoriaOption {
  id: number;
  nome: string;
}

interface ModalEditarTransacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  descricao: string;
  onDescricaoChange: (v: string) => void;
  valor: string;
  onValorChange: (v: string) => void;
  tipo: "entrada" | "saida" | "transferencia";
  onTipoChange: (v: "entrada" | "saida" | "transferencia") => void;
  data: string;
  onDataChange: (v: string) => void;
  categoria: string;
  onCategoriaChange: (v: string) => void;
  categorias: CategoriaOption[];
  comprovanteAtualUrl?: string | null;
  comprovante: File | null;
  onComprovanteChange: (f: File | null) => void;
  isSaving: boolean;
  onSalvar: () => void;
}

const ModalEditarTransacao = ({
  open, onOpenChange,
  descricao, onDescricaoChange,
  valor, onValorChange,
  tipo, onTipoChange,
  data, onDataChange,
  categoria, onCategoriaChange,
  categorias,
  comprovanteAtualUrl,
  comprovante, onComprovanteChange,
  isSaving, onSalvar,
}: ModalEditarTransacaoProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!comprovante && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [comprovante]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar transação</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3">
          <Input
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => onDescricaoChange(e.target.value)}
          />
          <Input
            placeholder="Valor"
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => onValorChange(e.target.value)}
          />
          <Select value={tipo} onValueChange={(v) => onTipoChange(v as "entrada" | "saida" | "transferencia")}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
              <SelectItem value="transferencia">Transferência</SelectItem>
            </SelectContent>
          </Select>
          <DateInput value={data} onChange={onDataChange} />
          <Select value={categoria} onValueChange={onCategoriaChange}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <p className="text-sm font-medium">Comprovante</p>
            {comprovanteAtualUrl ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.open(comprovanteAtualUrl, "_blank", "noopener,noreferrer")}
              >
                Ver comprovante atual
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum comprovante anexado.</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onComprovanteChange(e.target.files?.[0] ?? null)}
            />
            {comprovante ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <span className="flex-1 truncate text-foreground">{comprovante.name}</span>
                <button
                  type="button"
                  onClick={() => onComprovanteChange(null)}
                  className="shrink-0 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remover ficheiro"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-muted-foreground font-normal"
                onClick={() => fileInputRef.current?.click()}
              >
                Escolher ficheiro
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Se selecionar um arquivo, ele será enviado ao salvar.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSalvar} disabled={isSaving}>
            {isSaving ? "Salvando…" : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditarTransacao;
