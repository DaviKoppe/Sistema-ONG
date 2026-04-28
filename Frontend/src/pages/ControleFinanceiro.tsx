import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Pencil } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  data: string;
  categoria: string;
}

const mockTransacoes: Transacao[] = [
  { id: "1", descricao: "Doação recebida", valor: 1500, tipo: "entrada", data: "2026-04-01", categoria: "Doações" },
  { id: "2", descricao: "Compra de materiais", valor: 350, tipo: "saida", data: "2026-04-05", categoria: "Materiais" },
  { id: "3", descricao: "Contribuição mensal", valor: 800, tipo: "entrada", data: "2026-04-10", categoria: "Doações" },
];

const ControleFinanceiro = () => {
  const [transacoesLocais, setTransacoesLocais] = useState<Transacao[]>(mockTransacoes);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<string>("");
  const [data, setData] = useState("");
  const [categoria, setCategoria] = useState("");
  const queryClient = useQueryClient();

  const { data: transacoesApi } = useQuery({
    queryKey: ["transacoes"],
    queryFn: async () => {
      const data = await apiJson<{ ok: boolean; results: any[] }>("/api/financeiro/transacoes/");
      return (data.results ?? []).map((t) => ({
        id: String(t.id),
        descricao: String(t.descricao ?? ""),
        valor: Number(t.valor),
        tipo: t.tipo === "saída" ? "saida" : (t.tipo as "entrada" | "saida"),
        data: String(t.data),
        categoria: String(t.categoria?.nome ?? "Geral"),
      })) as Transacao[];
    },
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await apiJson("/api/financeiro/transacoes/", {
        method: "POST",
        body: JSON.stringify({
          descricao,
          valor: Number(valor),
          tipo: tipo === "saida" ? "saída" : tipo,
          data,
          categoria: categoria || "Geral",
        }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transacoes"] });
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

  const transacoes = useMemo(
    () => (transacoesApi && transacoesApi.length > 0 ? transacoesApi : transacoesLocais),
    [transacoesApi, transacoesLocais],
  );

  const totalEntradas = transacoes.filter((t) => t.tipo === "entrada").reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes.filter((t) => t.tipo === "saida").reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !tipo || !data) return;
    try {
      await createMutation.mutateAsync();
    } catch {
      // fallback local se não estiver logado / backend indisponível
      const nova: Transacao = {
        id: Date.now().toString(),
        descricao,
        valor: parseFloat(valor),
        tipo: tipo as "entrada" | "saida",
        data,
        categoria: categoria || "Geral",
      };
      setTransacoesLocais([nova, ...transacoesLocais]);
    }
    setDescricao("");
    setValor("");
    setTipo("");
    setData("");
    setCategoria("");
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onError: () => setTransacoesLocais(transacoesLocais.filter((t) => t.id !== id)),
    });
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

        {/* Add transaction form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Transações</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <Input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            <Input placeholder="Valor" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            <Input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
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
              {transacoes.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.descricao}</TableCell>
                  <TableCell className={t.tipo === "entrada" ? "text-success font-semibold" : "text-destructive font-semibold"}>
                    {t.tipo === "entrada" ? "+" : "-"} {formatCurrency(t.valor)}
                  </TableCell>
                  <TableCell className="capitalize">{t.tipo === "saida" ? "Saída" : "Entrada"}</TableCell>
                  <TableCell>{new Date(t.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{t.categoria}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(t.id)}>
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
  );
};

export default ControleFinanceiro;
