# employer/forms.py

from django import forms
from user.models import CustomUser
from .models import EmployerProfile
from django.contrib.auth.forms import UserCreationForm

class EmployerProfileForm(forms.ModelForm):

    terms_accepted = forms.BooleanField(
        required=True,
        label="I have read and agree to the Terms of Service", # This label will not be used if you manually render it in template
        error_messages={'required': 'You must accept the Terms of Service to register.'}
    )

    class Meta:
        model = EmployerProfile
        fields = ['name', 'email', 'logo', 'industry', 'number_employees', 'company_website', 'location', 'about']