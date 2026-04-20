from django import forms
from datetime import date
from .models import Transacao

class TransacaoForm(forms.ModelForm):
    class Meta:
        model = Transacao
        fields = ['descricao', 'valor', 'tipo', 'data', 'comprovante']
        widgets = {
            'data': forms.DateInput(attrs={'type': 'date'}),
            'descricao': forms.TextInput(attrs={'placeholder': 'Descrição da transação'}),
        }

    def clean_valor(self):
        valor = self.cleaned_data.get('valor')
        if valor <= 0:
            raise forms.ValidationError('O valor deve ser maior que zero.')
        return valor

    def clean_descricao(self):
        descricao = self.cleaned_data.get('descricao')
        if len(descricao) < 3:
            raise forms.ValidationError('A descrição deve ter pelo menos 3 caracteres.')
        return descricao

    def clean_data(self):
        data = self.cleaned_data.get('data')
        if data > date.today():
            raise forms.ValidationError('A data não pode ser no futuro.')
        return data