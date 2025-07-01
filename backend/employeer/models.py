from django.db import models
from user.models import CustomUser

class EmployerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='employer_profile')
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='company_logos/',blank=True)  # Files will be stored in the 'company_logos' directory in your bucket
    email = models.EmailField(max_length=254)  # ✅ use EmailField for validation
    industry = models.CharField(max_length=100)
    company_website = models.URLField(blank=True)
    location = models.CharField(max_length=255)
    number_employees = models.IntegerField()
    about = models.TextField(blank=True)

    def __str__(self):
        return self.name
