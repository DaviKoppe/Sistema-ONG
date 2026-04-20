from django.urls import path
from . import views

urlpatterns = [
    path('transacoes/nova/', views.cadastrar_transacao, name='cadastrar_transacao'),
    path('transacoes/<int:pk>/editar/', views.editar_transacao, name='editar_transacao'),
    path('transacoes/<int:pk>/excluir/', views.excluir_transacao, name='excluir_transacao'),
]