import json
from decimal import Decimal, InvalidOperation

from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse, HttpRequest
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Categoria, Transacao


def _json_error(message: str, *, status: int = 400):
    return JsonResponse({"ok": False, "error": message}, status=status)


def _normalize_tipo(value: str | None):
    """
    Aceita variações do frontend (com/sem acento) e converte para os valores
    usados pelo Model (choices).
    """
    if value is None:
        return None
    v = str(value).strip()
    if v == "saida":
        return "saída"
    if v == "transferência":
        return "transferencia"
    return v


def _transacao_to_dict(t: Transacao):
    return {
        "id": t.id,
        "descricao": t.descricao,
        "valor": str(t.valor),
        "data": t.data.isoformat(),
        "tipo": t.tipo,
        "categoria": {"id": t.categoria_id, "nome": t.categoria.nome} if t.categoria_id else None,
        "usuario_id": t.usuario_id,
        "comprovante_url": t.comprovante.url if t.comprovante else None,
    }


@require_http_methods(["GET"])
def categorias_list(request: HttpRequest):
    categorias = [{"id": c.id, "nome": c.nome} for c in Categoria.objects.order_by("nome")]
    return JsonResponse({"ok": True, "results": categorias})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def transacoes_list_create(request: HttpRequest):
    if request.method == "GET":
        transacoes = Transacao.objects.select_related("categoria").order_by("-data", "-id")[:500]
        return JsonResponse({"ok": True, "results": [_transacao_to_dict(t) for t in transacoes]})

    # POST
    if not request.user.is_authenticated or not request.user.is_staff:
        return _json_error("Apenas administrador pode cadastrar transações.", status=403)

    # Aceita tanto JSON quanto multipart/form-data (para upload de comprovante)
    if request.FILES or (request.content_type or "").startswith("multipart/form-data"):
        payload = request.POST
        arquivo = request.FILES.get("comprovante")
    else:
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            return _json_error("JSON inválido.")
        arquivo = None

    descricao = (payload.get("descricao") or "").strip()
    if len(descricao) < 3:
        return _json_error("Descrição deve ter pelo menos 3 caracteres.")

    try:
        valor = Decimal(str(payload.get("valor")))
    except (InvalidOperation, TypeError):
        return _json_error("Valor inválido.")
    if valor <= 0:
        return _json_error("O valor deve ser maior que zero.")

    tipo = payload.get("tipo")
    tipo = _normalize_tipo(tipo)
    if tipo not in {"entrada", "saída", "transferencia"}:
        return _json_error("Tipo inválido. Use: entrada, saída, transferencia.")

    data = parse_date(payload.get("data") or "")
    if not data:
        return _json_error("Data inválida (use YYYY-MM-DD).")

    categoria = None
    categoria_id = payload.get("categoria_id")
    if categoria_id:
        categoria = get_object_or_404(Categoria, pk=categoria_id)
    else:
        categoria_nome = (payload.get("categoria") or payload.get("categoria_nome") or "").strip()
        if not categoria_nome:
            return _json_error("Informe categoria_id ou categoria (nome).")
        categoria, _ = Categoria.objects.get_or_create(nome=categoria_nome)

    transacao = Transacao.objects.create(
        usuario=request.user,
        descricao=descricao,
        valor=valor,
        tipo=tipo,
        data=data,
        categoria=categoria,
        comprovante=arquivo,
    )
    return JsonResponse({"ok": True, "result": _transacao_to_dict(transacao)}, status=201)


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "DELETE"])
def transacao_detail(request: HttpRequest, pk: int):
    transacao = get_object_or_404(Transacao.objects.select_related("categoria"), pk=pk)

    if request.method == "GET":
        return JsonResponse({"ok": True, "result": _transacao_to_dict(transacao)})

    if not request.user.is_authenticated or not request.user.is_staff:
        return _json_error("Apenas administrador pode alterar/excluir transações.", status=403)

    if request.method == "DELETE":
        transacao.delete()
        return JsonResponse({"ok": True})

    # PUT/PATCH
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return _json_error("JSON inválido.")

    if "descricao" in payload:
        descricao = (payload.get("descricao") or "").strip()
        if len(descricao) < 3:
            return _json_error("Descrição deve ter pelo menos 3 caracteres.")
        transacao.descricao = descricao

    if "valor" in payload:
        try:
            valor = Decimal(str(payload.get("valor")))
        except (InvalidOperation, TypeError):
            return _json_error("Valor inválido.")
        if valor <= 0:
            return _json_error("O valor deve ser maior que zero.")
        transacao.valor = valor

    if "tipo" in payload:
        tipo = _normalize_tipo(payload.get("tipo"))
        if tipo not in {"entrada", "saída", "transferencia"}:
            return _json_error("Tipo inválido. Use: entrada, saída, transferencia.")
        transacao.tipo = tipo

    if "data" in payload:
        data = parse_date(payload.get("data") or "")
        if not data:
            return _json_error("Data inválida (use YYYY-MM-DD).")
        transacao.data = data

    if "categoria_id" in payload:
        categoria_id = payload.get("categoria_id")
        if not categoria_id:
            return _json_error("categoria_id é obrigatório.")
        transacao.categoria = get_object_or_404(Categoria, pk=categoria_id)
    elif "categoria" in payload or "categoria_nome" in payload:
        categoria_nome = (payload.get("categoria") or payload.get("categoria_nome") or "").strip()
        if not categoria_nome:
            return _json_error("Categoria inválida.")
        transacao.categoria, _ = Categoria.objects.get_or_create(nome=categoria_nome)

    transacao.save()
    return JsonResponse({"ok": True, "result": _transacao_to_dict(transacao)})


@csrf_exempt
@require_http_methods(["POST"])
def transacao_upload_comprovante(request: HttpRequest, pk: int):
    transacao = get_object_or_404(Transacao, pk=pk)

    if not request.user.is_authenticated or not request.user.is_staff:
        return _json_error("Apenas administrador pode alterar transações.", status=403)

    arquivo = request.FILES.get("comprovante")
    if not arquivo:
        return _json_error("Envie o arquivo no campo 'comprovante'.")

    transacao.comprovante = arquivo
    transacao.save()
    return JsonResponse({"ok": True, "result": _transacao_to_dict(transacao)})


@csrf_exempt
@require_http_methods(["POST"])
def transacao_update_multipart(request: HttpRequest, pk: int):
    """
    Atualiza a transação (campos + comprovante) via multipart/form-data em um único request.
    Campos esperados (todos opcionais): descricao, valor, tipo, data, categoria ou categoria_id.
    Arquivo opcional: comprovante.
    """
    transacao = get_object_or_404(Transacao.objects.select_related("categoria"), pk=pk)

    if not request.user.is_authenticated or not request.user.is_staff:
        return _json_error("Apenas administrador pode alterar transações.", status=403)

    data = request.POST

    if "descricao" in data:
        descricao = (data.get("descricao") or "").strip()
        if len(descricao) < 3:
            return _json_error("Descrição deve ter pelo menos 3 caracteres.")
        transacao.descricao = descricao

    if "valor" in data:
        try:
            valor = Decimal(str(data.get("valor")))
        except (InvalidOperation, TypeError):
            return _json_error("Valor inválido.")
        if valor <= 0:
            return _json_error("O valor deve ser maior que zero.")
        transacao.valor = valor

    if "tipo" in data:
        tipo = _normalize_tipo(data.get("tipo"))
        if tipo not in {"entrada", "saída", "transferencia"}:
            return _json_error("Tipo inválido. Use: entrada, saída, transferencia.")
        transacao.tipo = tipo

    if "data" in data:
        parsed = parse_date(data.get("data") or "")
        if not parsed:
            return _json_error("Data inválida (use YYYY-MM-DD).")
        transacao.data = parsed

    if "categoria_id" in data:
        categoria_id = data.get("categoria_id")
        if not categoria_id:
            return _json_error("categoria_id é obrigatório.")
        transacao.categoria = get_object_or_404(Categoria, pk=categoria_id)
    elif "categoria" in data or "categoria_nome" in data:
        categoria_nome = (data.get("categoria") or data.get("categoria_nome") or "").strip()
        if not categoria_nome:
            return _json_error("Categoria inválida.")
        transacao.categoria, _ = Categoria.objects.get_or_create(nome=categoria_nome)

    arquivo = request.FILES.get("comprovante")
    if arquivo is not None:
        transacao.comprovante = arquivo

    transacao.save()
    return JsonResponse({"ok": True, "result": _transacao_to_dict(transacao)})
