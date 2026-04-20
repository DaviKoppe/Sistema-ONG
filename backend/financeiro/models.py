from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Categoria(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"

class Transacao (models.Model):
    usuario = models.ForeignKey(User,on_delete=models.CASCADE)
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saída', 'Saída'),
        ('transferencia', 'Transferência'),
    ]

    descricao = models.CharField(max_length=255)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data = models.DateField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
   

    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE
    )

    comprovante = models.ImageField(
        upload_to='comprovantes/',
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = "Transação"
        verbose_name_plural = "Transações"

    def __str__(self):
        return f"{self.tipo} - R$ {self.valor} - {self.categoria}"

