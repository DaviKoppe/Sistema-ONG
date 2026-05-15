import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Trash2, Pencil, Plus, Tag, X, Check, FileDown, ChevronDown, FilterX, ArrowLeft, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import { cn } from "@/lib/utils";
import ScrollToTopButton from "@/components/ScrollToTopButton";

interface CategoriaItem {
  id: number;
  nome: string;
}

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
  const fileInputRef                                = useRef<HTMLInputElement>(null);
  const editFileInputRef                            = useRef<HTMLInputElement>(null);
  const filtrosRef                                  = useRef<HTMLDivElement>(null);
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
  const [selectedCategoriaIds, setSelectedCategoriaIds] = useState<number[]>([]);
  const [editingCategoriaId, setEditingCategoriaId] = useState<number | null>(null);
  const [deleteCatOpen, setDeleteCatOpen]           = useState(false);
  const [deletingCatIds, setDeletingCatIds]         = useState<number[]>([]);
  const [filtrosAbertos, setFiltrosAbertos]         = useState(false);
  const [busca, setBusca]                           = useState("");
  const [filtroTipo, setFiltroTipo]                 = useState("todos");
  const [filtroCategoria, setFiltroCategoria]       = useState("todas");
  const [dataInicial, setDataInicial]               = useState("");
  const [dataFinal, setDataFinal]                   = useState("");

  const navigate = useNavigate();
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
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      if (editFileInputRef.current) editFileInputRef.current.value = "";
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

  const { data: categorias = [] } = useQuery<CategoriaItem[]>({
    queryKey: ["categorias"],
    queryFn: async () => {
      const res = await apiJson<{ ok: boolean; results: CategoriaItem[] }>("/api/financeiro/categorias/");
      return res.results ?? [];
    },
  });

  const createCategoriaMutation = useMutation({
    mutationFn: async (nome: string) =>
      apiJson("/api/financeiro/categorias/", { method: "POST", body: JSON.stringify({ nome }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categorias"] }),
  });

  const updateCategoriaMutation = useMutation({
    mutationFn: async ({ id, nome }: { id: number; nome: string }) =>
      apiJson(`/api/financeiro/categorias/${id}/`, { method: "PATCH", body: JSON.stringify({ nome }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
    },
  });

  const deleteCategoriaMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      if (ids.length === 1) {
        return apiJson(`/api/financeiro/categorias/${ids[0]}/`, { method: "DELETE" });
      }
      return apiJson("/api/financeiro/categorias/bulk-delete/", {
        method: "POST",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      setSelectedCategoriaIds([]);
      setDeleteCatOpen(false);
      setDeletingCatIds([]);
    },
  });

  const transacoes = transacoesApi ?? [];

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t) => {
      if (busca && !t.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
      if (filtroTipo !== "todos" && t.tipo !== filtroTipo) return false;
      if (filtroCategoria !== "todas" && t.categoria !== filtroCategoria) return false;
      if (dataInicial && t.data < dataInicial) return false;
      if (dataFinal && t.data > dataFinal) return false;
      return true;
    });
  }, [transacoes, busca, filtroTipo, filtroCategoria, dataInicial, dataFinal]);

  const filtrosAtivos = !!(busca || filtroTipo !== "todos" || filtroCategoria !== "todas" || dataInicial || dataFinal);

  const limparFiltros = () => {
    setBusca("");
    setFiltroTipo("todos");
    setFiltroCategoria("todas");
    setDataInicial("");
    setDataFinal("");
  };

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
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    if (editFileInputRef.current) editFileInputRef.current.value = "";
    setEditOpen(true);
  };

  const handleAddCategoria = async () => {
    const nome = novaCategoria.trim();
    if (!nome) return;
    if (editingCategoriaId !== null) {
      await updateCategoriaMutation.mutateAsync({ id: editingCategoriaId, nome });
      setEditingCategoriaId(null);
      setSelectedCategoriaIds([]);
      setNovaCategoria("");
    } else {
      await createCategoriaMutation.mutateAsync(nome);
      setNovaCategoria("");
    }
  };

  const handleToggleCategoria = (id: number) => {
    if (editingCategoriaId !== null) return;
    setSelectedCategoriaIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleEditSelected = () => {
    if (selectedCategoriaIds.length !== 1) return;
    const cat = categorias.find((c) => c.id === selectedCategoriaIds[0]);
    if (!cat) return;
    setEditingCategoriaId(cat.id);
    setNovaCategoria(cat.nome);
  };

  const handleCancelEdit = () => {
    setEditingCategoriaId(null);
    setNovaCategoria("");
    setSelectedCategoriaIds([]);
  };

  const handleAskDeleteCat = (ids: number[]) => {
    setDeletingCatIds(ids);
    setDeleteCatOpen(true);
  };

  const handleConfirmDeleteCat = async () => {
    await deleteCategoriaMutation.mutateAsync(deletingCatIds);
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="animate-fade-in py-10 px-6">
      <div className="container max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/prestacao-de-contas")} className="h-9 w-9 text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Controle financeiro</h1>
              <p className="text-sm text-muted-foreground">Gerencie entradas, saídas e categorias da organização.</p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => navigate("/exportar-relatorio")} className="gap-2 shrink-0">
            <FileDown className="w-4 h-4" />
            Exportar relatório
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Receitas</p>
              <p className="text-xl font-bold text-success">{formatCurrency(totalEntradas)}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-destructive" />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Despesas</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(totalSaidas)}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
            <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${saldo >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
              <Wallet className={`w-5 h-5 ${saldo >= 0 ? "text-primary" : "text-destructive"}`} />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Saldo Atual</p>
              <p className={`text-xl font-bold ${saldo >= 0 ? "text-primary" : "text-destructive"}`}>{formatCurrency(saldo)}</p>
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-5">Categorias</h2>

          {/* Toolbar unificada */}
          <div className="flex items-center gap-3 mb-4">
            <Input
              placeholder={editingCategoriaId !== null ? `Editando "${categorias.find(c => c.id === editingCategoriaId)?.nome}"…` : "Nova categoria..."}
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategoria(); } }}
              className="w-80"
            />
            {editingCategoriaId !== null ? (
              <>
                <Button type="button" size="sm" onClick={handleAddCategoria} disabled={!novaCategoria.trim() || updateCategoriaMutation.isPending}>
                  <Check className="w-3.5 h-3.5" /> Salvar
                </Button>
                <Button type="button" size="sm" variant="ghost" className="border" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button type="button" size="sm" onClick={handleAddCategoria} disabled={!novaCategoria.trim() || createCategoriaMutation.isPending}>
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </Button>
            )}

            <div className="h-5 w-px bg-border mx-1 shrink-0" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEditSelected}
              disabled={selectedCategoriaIds.length !== 1 || editingCategoriaId !== null}
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAskDeleteCat(selectedCategoriaIds)}
              disabled={selectedCategoriaIds.length === 0 || editingCategoriaId !== null}
              className={cn(
                selectedCategoriaIds.length > 0 && editingCategoriaId === null
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
                Nenhuma categoria cadastrada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {categorias.map((cat) => {
                  const isSelected = selectedCategoriaIds.includes(cat.id);
                  const isBeingEdited = editingCategoriaId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggleCategoria(cat.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-all select-none",
                        editingCategoriaId !== null
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
                        <span className="truncate">{cat.nome}</span>
                      </span>
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); handleAskDeleteCat([cat.id]); }}
                        className="shrink-0 ml-1 rounded-sm hover:opacity-60 transition-opacity"
                        aria-label={`Remover ${cat.nome}`}
                      >
                        <X className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedCategoriaIds.length > 0 && editingCategoriaId === null && (
            <p className="text-xs text-muted-foreground mt-3">
              {selectedCategoriaIds.length} categoria{selectedCategoriaIds.length > 1 ? "s" : ""} selecionada{selectedCategoriaIds.length > 1 ? "s" : ""}.
              {selectedCategoriaIds.length === 1 ? " Clique em Editar ou Excluir." : " Clique em Excluir para remover todas."}
            </p>
          )}
        </div>

        {/* Add transaction form */}
        <div ref={filtrosRef} className="bg-card border border-border rounded-lg p-6">
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
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="col-span-2 md:col-span-3">
              <p className="text-sm font-medium mb-2">Comprovante</p>
              <input
                ref={fileInputRef}
                
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setComprovante(e.target.files?.[0] ?? null)}
              />
              {comprovante ? (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                  <span className="flex-1 truncate text-foreground">{comprovante.name}</span>
                  <button
                    type="button"
                    onClick={() => { setComprovante(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
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
            </div>
            <div className="col-span-2 md:col-span-2 flex items-end gap-2">
              <Button type="submit" onClick={handleAdd} className="flex-1">
                Salvar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFiltrosAbertos((v) => !v)}
                className="flex-1 gap-2"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", filtrosAbertos && "rotate-180")} />
                {filtrosAbertos ? "Desabilitar Filtros" : "Habilitar Filtros"}
              </Button>
            </div>
          </form>

          {/* Painel de filtros */}
          {filtrosAbertos && (
            <div className="bg-muted/20 border border-border rounded-lg p-5 space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descrição</p>
                  <Input placeholder="Buscar por descrição..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</p>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger><SelectValue placeholder="Todos os tipos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</p>
                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      <SelectItem value="todas">Todas as categorias</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data inicial</p>
                  <Input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data final</p>
                  <Input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
                </div>
                <div className="flex flex-col justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={limparFiltros}
                    disabled={!filtrosAtivos}
                    className={cn(
                      "w-full gap-2 transition-colors",
                      filtrosAtivos
                        ? "border-primary text-primary hover:bg-primary/30 hover:text-primary"
                        : "border-primary/40 text-primary/40 cursor-not-allowed"
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
                  <span className="font-semibold text-foreground">{transacoesFiltradas.length}</span>{" "}
                  de{" "}
                  <span className="font-semibold text-foreground">{transacoes.length}</span> transações.
                </p>
              )}
            </div>
          )}

          {/* Transactions table */}
          <div>
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
              {transacoesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                    {filtrosAtivos ? "Nenhuma transação encontrada com os filtros aplicados." : "Nenhuma transação cadastrada."}
                  </TableCell>
                </TableRow>
              ) : null}
              {transacoesFiltradas.map((t) => (
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
                          className="h-8 px-2 text-xs border"
                          onClick={() => window.open(t.comprovanteUrl ?? "", "_blank", "noopener,noreferrer")}
                        >
                          Ver comprovante
                        </Button>
                      ) : null}
                      <Button type="button" variant="ghost" size="icon" className="group h-8 w-8 hover:bg-primary" onClick={() => handleOpenEdit(t)}>
                        <Pencil className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-white" />
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
      </div>

      <ScrollToTopButton targetRef={filtrosRef} />

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
                  <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>
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
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setEditComprovante(e.target.files?.[0] ?? null)}
              />
              {editComprovante ? (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                  <span className="flex-1 truncate text-foreground">{editComprovante.name}</span>
                  <button
                    type="button"
                    onClick={() => { setEditComprovante(null); if (editFileInputRef.current) editFileInputRef.current.value = ""; }}
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
                  onClick={() => editFileInputRef.current?.click()}
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

      <AlertDialog
        open={deleteCatOpen}
        onOpenChange={(v) => {
          setDeleteCatOpen(v);
          if (!v) setDeletingCatIds([]);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {deletingCatIds.length === 1 ? "categoria" : `${deletingCatIds.length} categorias`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCatIds.length === 1
                ? `A categoria "${categorias.find(c => c.id === deletingCatIds[0])?.nome}" será removida permanentemente. Todas as transações vinculadas a ela também serão excluídas.`
                : `As ${deletingCatIds.length} categorias selecionadas serão removidas permanentemente junto com todas as transações vinculadas a elas.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleConfirmDeleteCat}
              disabled={deleteCategoriaMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategoriaMutation.isPending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default ControleFinanceiro;
