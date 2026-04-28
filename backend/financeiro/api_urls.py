from django.urls import path

from . import api_views


urlpatterns = [
    path("categorias/", api_views.categorias_list, name="api_categorias_list"),
    path("transacoes/", api_views.transacoes_list_create, name="api_transacoes_list_create"),
    path("transacoes/<int:pk>/", api_views.transacao_detail, name="api_transacao_detail"),
]

