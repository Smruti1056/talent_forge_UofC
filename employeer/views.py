# employer/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .forms import EmployerProfileForm
from .models import EmployerProfile

@login_required
def create_employer_profile(request):
    user = request.user
    # Redirect if profile already exists
    if hasattr(user, 'employerprofile'):
        
        return redirect('user:profile')  # ✅ Fix applied here

    if request.method == 'POST':
        form = EmployerProfileForm(request.POST, request.FILES)
        if form.is_valid():
            profile = form.save(commit=False)
            profile.user = user
            profile.save()

            return redirect('employer_dashboard')
    else:
        form = EmployerProfileForm()
    
    return render(request, 'employer/create_profile.html', {'profile_form': form})

@login_required
def employer_dashboard(request):
    profile = get_object_or_404(EmployerProfile, user=request.user)
    return render(request, 'employer/dashboard.html', {'profile': profile})

@login_required
def employer_profile_api(request):
    profile = get_object_or_404(EmployerProfile, user=request.user)
    data = {
        'company_name': profile.name,
        'email': profile.email,
        'industry': profile.industry,
    }
    return JsonResponse(data)