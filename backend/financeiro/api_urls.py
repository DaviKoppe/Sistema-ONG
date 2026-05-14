from django.urls import path

from . import api_views


urlpatterns = [
    path("categorias/", api_views.categorias_list, name="api_categorias_list"),
    path("categorias/bulk-delete/", api_views.categorias_bulk_delete, name="api_categorias_bulk_delete"),
    path("categorias/<int:pk>/", api_views.categoria_detail, name="api_categoria_detail"),
    path("transacoes/", api_views.transacoes_list_create, name="api_transacoes_list_create"),
    path("transacoes/<int:pk>/", api_views.transacao_detail, name="api_transacao_detail"),
    path(
        "transacoes/<int:pk>/update/",
        api_views.transacao_update_multipart,
        name="api_transacao_update_multipart",
    ),
    path(
        "transacoes/<int:pk>/comprovante/",
        api_views.transacao_upload_comprovante,
        name="api_transacao_upload_comprovante",
    ),
]

