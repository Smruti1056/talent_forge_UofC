from django import forms
from user.models import CustomUser
from .models import JobSeekerProfile
from .models import Education
from .models import Certification
from .models import JobExperience
from django.forms import inlineformset_factory

class JobSeekerProfileForm(forms.ModelForm):
    class Meta:
        model = JobSeekerProfile
        fields = [
            'first_name', 'last_name', 'location', 'role', 'email', 'picture',
            'phone_number', 'industry', 'about'
        ]
        widgets = {
            'about': forms.Textarea(attrs={'rows': 4}),
        }
    
class EducationForm(forms.ModelForm):
    class Meta:
        model = Education
        fields = [
            'institution', 'degree', 'field_of_study', 'start_date', 'end_date', 'description'
        ]
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }
        exclude = ('job_seeker',)

class JobExperienceForm(forms.ModelForm):
    class Meta:
        model = JobExperience
        fields = [
            'company_name', 'position', 'start_date', 'end_date', 'location', 'responsibilities'
        ]
        widgets = {
            'responsibilities': forms.Textarea(attrs={'rows': 3}),
        }
        exclude = ('job_seeker',)

class CertificationForm(forms.ModelForm):
    class Meta:
        model = Certification
        fields = [
            'name', 'issuer', 'issue_date', 'expiration_date', 'credential_url'
        ]
        exclude = ('job_seeker',)

# Inline formsets
EducationFormSet = inlineformset_factory(
    JobSeekerProfile, Education, form=EducationForm, extra=1, can_delete=True
)
JobExperienceFormSet = inlineformset_factory(
    JobSeekerProfile, JobExperience, form=JobExperienceForm, extra=1, can_delete=True
)
CertificationFormSet = inlineformset_factory(
    JobSeekerProfile, Certification, form=CertificationForm, extra=1, can_delete=True
)