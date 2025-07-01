from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import EmployerProfile


class EmployerProfileTests(TestCase):
    def test_str_returns_company_name(self):
        user = get_user_model().objects.create(username="employer")
        profile = EmployerProfile.objects.create(
            user=user,
            name="Acme Corp",
            email="acme@example.com",
            industry="Tech",
            location="NY",
            number_employees=100,
        )
        self.assertEqual(str(profile), "Acme Corp")
