# employer/forms.py

from django import forms
from user.models import CustomUser
from .models import EmployerProfile
from django.contrib.auth.forms import UserCreationForm

class EmployerUserForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password1', 'password2')

class EmployerProfileForm(forms.ModelForm):
    class Meta:
        model = EmployerProfile
        fields = ['name', 'email', 'logo', 'industry', 'number_employees', 'company_website', 'location', 'about']
