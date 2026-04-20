from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from .models import Transacao
from .forms import TransacaoForm

def cadastrar_transacao(request):
    if request.method == 'POST':
        form = TransacaoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Transação cadastrada com sucesso!')
            return redirect('listar_transacoes')
    else:
        form = TransacaoForm()
    return render(request, 'financeiro/cadastrar_transacao.html', {'form': form})


def editar_transacao(request, pk):
    transacao = get_object_or_404(Transacao, pk=pk)
    if request.method == 'POST':
        form = TransacaoForm(request.POST, request.FILES, instance=transacao)
        if form.is_valid():
            form.save()
            messages.success(request, 'Transação atualizada com sucesso!')
            return redirect('listar_transacoes')
    else:
        form = TransacaoForm(instance=transacao)
    return render(request, 'financeiro/editar_transacao.html', {'form': form, 'transacao': transacao})


def excluir_transacao(request, pk):
    transacao = get_object_or_404(Transacao, pk=pk)
    if request.method == 'POST':
        transacao.delete()
        messages.success(request, 'Transação excluída com sucesso!')
        return redirect('listar_transacoes')
    return render(request, 'financeiro/confirmar_exclusao.html', {'transacao': transacao})