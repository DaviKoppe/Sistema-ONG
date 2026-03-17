from django.contrib import admin
from .models import Categoria, Transacao

admin.site.register(Categoria)

@admin.register(Transacao)
class TransacaoAdmin(admin.ModelAdmin):
    list_display = ('valor','tipo','data','categoria','usuario')

    def has_add_permission(self, request):
        return request.user.is_superuser
    
    def has_change_permission(self, request, obj = None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj = None):
        return request.user.is_superuser