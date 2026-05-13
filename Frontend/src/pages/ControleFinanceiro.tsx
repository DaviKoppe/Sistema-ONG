import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Pencil, Plus, Tag, X, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida" | "transferencia";
  data: string;
  categoria: string;
  comprovanteUrl?: string | null;
}

function toApiTipo(tipo: Transacao["tipo"]): "entrada" | "saída" | "transferencia" {
  if (tipo === "saida") return "saída";
  if (tipo === "transferencia") return "transferencia";
  return "entrada";
}

const ControleFinanceiro = () => {
  const [descricao, setDescricao]                   = useState("");
  const [valor, setValor]                           = useState("");
  const [tipo, setTipo]                             = useState<string>("");
  const [data, setData]                             = useState("");
  const [categoria, setCategoria]                   = useState("");
  const [comprovante, setComprovante]               = useState<File | null>(null);
  const [editOpen, setEditOpen]                     = useState(false);
  const [editingId, setEditingId]                   = useState<string | null>(null);
  const [editDescricao, setEditDescricao]           = useState("");
  const [editValor, setEditValor]                   = useState("");
  const [editTipo, setEditTipo]                     = useState<Transacao["tipo"]>("entrada");
  const [editData, setEditData]                     = useState("");
  const [editCategoria, setEditCategoria]           = useState("");
  const [editComprovante, setEditComprovante]       = useState<File | null>(null);
  const [deleteOpen, setDeleteOpen]                 = useState(false);
  const [deletingId, setDeletingId]                 = useState<string | null>(null);
  const [novaCategoria, setNovaCategoria]           = useState("");
  const [categorias, setCategorias]                 = useState<string[]>(["Geral"]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [editingCategoria, setEditingCategoria]     = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: transacoesApi, isLoading, isError, error } = useQuery({
    queryKey: ["transacoes"],
    queryFn: async () => {
      const data = await apiJson<{ ok: boolean; results: any[] }>("/api/financeiro/transacoes/");
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

  const createMutation = useMutation({
    mutationFn: async () => {
      if (comprovante) {
        const fd = new FormData();
        fd.append("descricao", descricao);
        fd.append("valor", String(Number(valor)));
        fd.append("tipo", toApiTipo(tipo as Transacao["tipo"]));
        fd.append("data", data);
        fd.append("categoria", categoria || "Geral");
        fd.append("comprovante", comprovante);

        const res = await fetch("/api/financeiro/transacoes/", { method: "POST", body: fd });
        const text = await res.text();
        const dataJson = text ? (JSON.parse(text) as unknown) : null;
        if (!res.ok) {
          const message =
            typeof (dataJson as any)?.error === "string"
              ? (dataJson as any).error
              : `Erro HTTP ${res.status}`;
          throw new Error(message);
        }
        return dataJson as any;
      }

      return await apiJson("/api/financeiro/transacoes/", {
        method: "POST",
        body: JSON.stringify({
          descricao,
          valor: Number(valor),
          tipo: toApiTipo(tipo as Transacao["tipo"]),
          data,
          categoria: categoria || "Geral",
        }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      setComprovante(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) throw new Error("Transação inválida para edição.");
      const fd = new FormData();
      fd.append("descricao", editDescricao);
      fd.append("valor", String(Number(editValor)));
      fd.append("tipo", toApiTipo(editTipo));
      fd.append("data", editData);
      fd.append("categoria", editCategoria || "Geral");
      if (editComprovante) fd.append("comprovante", editComprovante);

      const res = await fetch(`/api/financeiro/transacoes/${editingId}/update/`, {
        method: "POST",
        body: fd,
      });
      const text = await res.text();
      const data = text ? (JSON.parse(text) as unknown) : null;
      if (!res.ok) {
        const message =
          typeof (data as any)?.error === "string"
            ? (data as any).error
            : `Erro HTTP ${res.status}`;
        throw new Error(message);
      }
      return data as any;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      setEditOpen(false);
      setEditingId(null);
      setEditComprovante(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiJson(`/api/financeiro/transacoes/${id}/`, { method: "DELETE" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transacoes"] });
    },
  });

  const transacoes = transacoesApi ?? [];

  const totalEntradas = transacoes.filter((t) => t.tipo === "entrada").reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter((t) => t.tipo === "saida").reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !tipo || !data) return;
    await createMutation.mutateAsync();
    setDescricao("");
    setValor("");
    setTipo("");
    setData("");
    setCategoria("");
    setComprovante(null);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAskDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleOpenEdit = (t: Transacao) => {
    setEditingId(t.id);
    setEditDescricao(t.descricao);
    setEditValor(String(t.valor));
    setEditTipo(t.tipo);
    setEditData(t.data);
    setEditCategoria(t.categoria);
    setEditComprovante(null);
    setEditOpen(true);
  };

  const handleAddCategoria = () => {
    const nome = novaCategoria.trim();
    if (!nome) return;
    if (editingCategoria !== null) {
      if (nome !== editingCategoria && categorias.includes(nome)) return;
      setCategorias((prev) => prev.map((c) => (c === editingCategoria ? nome : c)));
      if (categoria === editingCategoria) setCategoria(nome);
      if (editCategoria === editingCategoria) setEditCategoria(nome);
      setEditingCategoria(null);
      setSelectedCategorias([]);
      setNovaCategoria("");
    } else {
      if (!categorias.includes(nome)) {
        setCategorias((prev) => [...prev, nome]);
        setNovaCategoria("");
      }
    }
  };

  const handleToggleCategoria = (cat: string) => {
    if (editingCategoria !== null) return;
    setSelectedCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleEditSelected = () => {
    if (selectedCategorias.length !== 1) return;
    setEditingCategoria(selectedCategorias[0]);
    setNovaCategoria(selectedCategorias[0]);
  };

  const handleCancelEdit = () => {
    setEditingCategoria(null);
    setNovaCategoria("");
    setSelectedCategorias([]);
  };

  const handleDeleteSelected = () => {
    const toDelete = new Set(selectedCategorias);
    setCategorias((prev) => prev.filter((c) => !toDelete.has(c)));
    if (toDelete.has(categoria)) setCategoria("");
    if (toDelete.has(editCategoria)) setEditCategoria("");
    setSelectedCategorias([]);
  };

  const handleDeleteOne = (cat: string) => {
    setCategorias((prev) => prev.filter((c) => c !== cat));
    setSelectedCategorias((prev) => prev.filter((c) => c !== cat));
    if (categoria === cat) setCategoria("");
    if (editCategoria === cat) setEditCategoria("");
    if (editingCategoria === cat) handleCancelEdit();
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="animate-fade-in py-10 px-6">
      <div className="container max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-extrabold text-foreground">Controle financeiro</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Saldo Atual</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(saldo)}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Receitas</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalEntradas)}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Despesas</p>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalSaidas)}</p>
          </div>
        </div>

        {/* Categorias */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-5">Categorias</h2>

          {/* Toolbar unificada: input + ações na mesma linha */}
          <div className="flex items-center gap-2 mb-5">
            <Input
              placeholder={editingCategoria ? `Editando "${editingCategoria}"…` : "Nova categoria..."}
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategoria(); } }}
              className="w-52 shrink-0"
            />
            {editingCategoria ? (
              <>
                <Button type="button" size="sm" onClick={handleAddCategoria} disabled={!novaCategoria.trim()}>
                  <Check className="w-3.5 h-3.5" /> Salvar
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button type="button" size="sm" onClick={handleAddCategoria} disabled={!novaCategoria.trim()}>
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </Button>
            )}

            <div className="h-5 w-px bg-border mx-1 shrink-0" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEditSelected}
              disabled={selectedCategorias.length !== 1 || editingCategoria !== null}
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={selectedCategorias.length === 0 || editingCategoria !== null}
              className={cn(
                selectedCategorias.length > 0 && editingCategoria === null
                  ? "text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                  : ""
              )}
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </Button>
          </div>

          {/* Painel de categorias em grid simétrico */}
          <div className="rounded-lg border border-border bg-muted/15 p-4 min-h-[76px]">
            {categorias.length === 0 ? (
              <div className="flex h-10 items-center justify-center text-sm text-muted-foreground">
                Nenhuma categoria criada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {categorias.map((cat) => {
                  const isSelected = selectedCategorias.includes(cat);
                  const isBeingEdited = editingCategoria === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleToggleCategoria(cat)}
                      className={cn(
                        "flex w-full items-center justify-between gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-all select-none",
                        editingCategoria !== null
                          ? isBeingEdited
                            ? "bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-300 ring-offset-1 cursor-default"
                            : "opacity-40 cursor-default bg-blue-50 text-blue-600 border-blue-200"
                          : isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm cursor-pointer"
                            : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 cursor-pointer"
                      )}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Tag className="w-3 h-3 shrink-0" />
                        <span className="truncate">{cat}</span>
                      </span>
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteOne(cat); }}
                        className="shrink-0 ml-1 rounded-sm hover:opacity-60 transition-opacity"
                        aria-label={`Remover ${cat}`}
                      >
                        <X className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedCategorias.length > 0 && editingCategoria === null && (
            <p className="text-xs text-muted-foreground mt-3">
              {selectedCategorias.length} categoria{selectedCategorias.length > 1 ? "s" : ""} selecionada{selectedCategorias.length > 1 ? "s" : ""}.
              {selectedCategorias.length === 1 ? " Clique em Editar ou Excluir." : " Clique em Excluir para remover todas."}
            </p>
          )}
        </div>

        {/* Add transaction form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Transações</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground mb-4">Carregando transações…</p>
          ) : isError ? (
            <p className="text-sm text-destructive mb-4">
              {(error as Error)?.message || "Erro ao carregar transações."}
            </p>
          ) : null}
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <Input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            <Input placeholder="Valor" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent className="max-h-[225px] overflow-y-auto">
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="col-span-2 md:col-span-5">
              <p className="text-sm font-medium mb-2">Comprovante</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setComprovante(e.target.files?.[0] ?? null)}
              />
            </div>
          </form>
          <div className="flex justify-end mb-6">
            <Button type="submit" onClick={handleAdd}>Salvar</Button>
          </div>

          {/* Transactions table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                    Nenhuma transação cadastrada.
                  </TableCell>
                </TableRow>
              ) : null}
              {transacoes.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.descricao}</TableCell>
                  <TableCell className={t.tipo === "entrada" ? "text-success font-semibold" : "text-destructive font-semibold"}>
                    {t.tipo === "entrada" ? "+" : "-"} {formatCurrency(t.valor)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {t.tipo === "saida" ? "Saída" : t.tipo === "transferencia" ? "Transferência" : "Entrada"}
                  </TableCell>
                  <TableCell>{new Date(t.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{t.categoria}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {t.comprovanteUrl ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => window.open(t.comprovanteUrl ?? "", "_blank", "noopener,noreferrer")}
                        >
                          Ver comprovante
                        </Button>
                      ) : null}
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(t)}>
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAskDelete(t.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar transação</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3">
            <Input placeholder="Descrição" value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} />
            <Input
              placeholder="Valor"
              type="number"
              step="0.01"
              value={editValor}
              onChange={(e) => setEditValor(e.target.value)}
            />
            <Select value={editTipo} onValueChange={(v) => setEditTipo(v as Transacao["tipo"])}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={editData} onChange={(e) => setEditData(e.target.value)} />
            <Select value={editCategoria} onValueChange={setEditCategoria}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <p className="text-sm font-medium">Comprovante</p>
              {transacoes.find((t) => t.id === editingId)?.comprovanteUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const url = transacoes.find((t) => t.id === editingId)?.comprovanteUrl ?? "";
                    if (url) window.open(url, "_blank", "noopener,noreferrer");
                  }}
                >
                  Ver comprovante atual
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhum comprovante anexado.</p>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setEditComprovante(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Se selecionar um arquivo, ele será enviado ao salvar.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditOpen(false);
                setEditingId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await updateMutation.mutateAsync();
              }}
              disabled={updateMutation.isPending}
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(v) => {
          setDeleteOpen(v);
          if (!v) setDeletingId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja mesmo excluir a transação?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => {
                if (deletingId) handleDelete(deletingId);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ControleFinanceiro;
