from django.urls import path
from . import views

urlpatterns = [
    path('create_employer_profile/', views.create_employer_profile, name='create_employer_profile'),
    path('employer_dashboard/', views.employer_dashboard, name='employer_dashboard'),
    path('api/employer/profile/', views.employer_profile_api, name='employer-profile-api'),
]