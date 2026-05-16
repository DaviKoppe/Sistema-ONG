import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DateInput from "@/components/ui/DateInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TabelaTransacoes from "@/components/TabelaTransacoes";
import ModalConfirmacao from "@/components/ModalConfirmacao";
import ModalEditarTransacao from "@/components/ModalEditarTransacao";
import FiltroTransacoes from "@/components/FiltroTransacoes";
import { Trash2, Pencil, Plus, Tag, X, Check, FileDown, SlidersHorizontal, ArrowLeft } from "lucide-react";
import ResumoFinanceiroCards from "@/components/ResumoFinanceiroCards";
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
  const [descricao, setDescricao]              = useState("");
  const [valor, setValor]                      = useState("");
  const [tipo, setTipo]                        = useState<string>("");
  const [data, setData]                        = useState("");
  const [categoria, setCategoria]              = useState("");
  const [comprovante, setComprovante]          = useState<File | null>(null);

  const fileInputRef                           = useRef<HTMLInputElement>(null);
  const filtrosRef                             = useRef<HTMLDivElement>(null);

  const [editOpen, setEditOpen]                = useState(false);
  const [editingId, setEditingId]              = useState<string | null>(null);
  const [editDescricao, setEditDescricao]      = useState("");
  const [editValor, setEditValor]              = useState("");
  const [editTipo, setEditTipo]                = useState<Transacao["tipo"]>("entrada");
  const [editData, setEditData]                = useState("");
  const [editCategoria, setEditCategoria]      = useState("");
  const [editComprovante, setEditComprovante]  = useState<File | null>(null);

  const [deleteOpen, setDeleteOpen]            = useState(false);
  const [deletingId, setDeletingId]            = useState<string | null>(null);
  const [deleteCatOpen, setDeleteCatOpen]      = useState(false);
  const [deletingCatIds, setDeletingCatIds]    = useState<number[]>([]);

  const [novaCategoria, setNovaCategoria]                = useState("");
  const [selectedCategoriaIds, setSelectedCategoriaIds]  = useState<number[]>([]);
  const [editingCategoriaId, setEditingCategoriaId]      = useState<number | null>(null);

  const [filtrosAbertos, setFiltrosAbertos]    = useState(false);
  const [busca, setBusca]                      = useState("");
  const [filtroTipo, setFiltroTipo]            = useState("todos");
  const [filtroCategoria, setFiltroCategoria]  = useState("todas");
  const [dataInicial, setDataInicial]          = useState("");
  const [dataFinal, setDataFinal]              = useState("");

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
        <ResumoFinanceiroCards totalEntradas={totalEntradas} totalSaidas={totalSaidas} saldo={saldo} />

        {/* Categorias */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-5">Categorias</h2>

          {/* Adicionar Categoria */}
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

          {/* Painel de categorias */}
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

        {/* Formulário de Transação */}
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
            <DateInput value={data} onChange={setData} required />
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
                variant={filtrosAbertos ? "default" : "outline"}
                onClick={() => setFiltrosAbertos((v) => !v)}
                className="flex-1 gap-2 transition-colors"
              >
                <SlidersHorizontal className={cn("w-4 h-4 transition-transform duration-300", filtrosAbertos && "rotate-180")} />
                {filtrosAbertos ? "Desabilitar filtros" : "Habilitar filtros"}
              </Button>
            </div>
          </form>

          {/* Painel de filtros */}
          {filtrosAbertos && (
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
                ...categorias.map((cat) => ({ value: cat.nome, label: cat.nome })),
              ]}
              filtrosAtivos={filtrosAtivos}
              totalFiltrado={transacoesFiltradas.length}
              totalGeral={transacoes.length}
              onLimparFiltros={limparFiltros}
              className="bg-muted/20 border border-border rounded-lg p-5 mb-6"
            />
          )}

          {/* Tabela de Transações */}
          <TabelaTransacoes
            transacoes={transacoesFiltradas}
            showCategoria
            showComprovante
            showAcoes
            onEdit={(t) => handleOpenEdit(t as Transacao)}
            onDelete={handleAskDelete}
            emptyMessage={filtrosAtivos ? "Nenhuma transação encontrada com os filtros aplicados." : "Nenhuma transação cadastrada."}
          />
        </div>
      </div>

      <ScrollToTopButton targetRef={filtrosRef} />

      <ModalEditarTransacao
        open={editOpen}
        onOpenChange={(v) => { setEditOpen(v); if (!v) setEditingId(null); }}
        descricao={editDescricao}
        onDescricaoChange={setEditDescricao}
        valor={editValor}
        onValorChange={setEditValor}
        tipo={editTipo}
        onTipoChange={setEditTipo}
        data={editData}
        onDataChange={setEditData}
        categoria={editCategoria}
        onCategoriaChange={setEditCategoria}
        categorias={categorias}
        comprovanteAtualUrl={transacoes.find((t) => t.id === editingId)?.comprovanteUrl}
        comprovante={editComprovante}
        onComprovanteChange={setEditComprovante}
        isSaving={updateMutation.isPending}
        onSalvar={() => updateMutation.mutate()}
      />

      <ModalConfirmacao
        open={deleteOpen}
        onOpenChange={(v) => { setDeleteOpen(v); if (!v) setDeletingId(null); }}
        title="Deseja mesmo excluir a transação?"
        description="Essa ação não pode ser desfeita."
        onConfirm={() => { if (deletingId) handleDelete(deletingId); }}
      />

      <ModalConfirmacao
        open={deleteCatOpen}
        onOpenChange={(v) => { setDeleteCatOpen(v); if (!v) setDeletingCatIds([]); }}
        title={deletingCatIds.length === 1 ? "Excluir categoria?" : `Excluir ${deletingCatIds.length} categorias?`}
        description={
          deletingCatIds.length === 1
            ? `A categoria "${categorias.find(c => c.id === deletingCatIds[0])?.nome}" será removida permanentemente. Todas as transações vinculadas a ela também serão excluídas.`
            : `As ${deletingCatIds.length} categorias selecionadas serão removidas permanentemente junto com todas as transações vinculadas a elas.`
        }
        onConfirm={handleConfirmDeleteCat}
        isLoading={deleteCategoriaMutation.isPending}
      />

    </div>
  );
};

export default ControleFinanceiro;
