from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .forms import JobSeekerProfileForm, EducationForm, CertificationForm, JobExperienceForm
from .models import JobSeekerProfile, Skill
from rest_framework import generics
from django.conf import settings 

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import JobSeekerProfileSerializer, SkillSerializer

def jobseeker_profile_page(request):
    if hasattr(request.user, 'job_seeker_profile'):
        return redirect('job_seeker_dashboard')  # Prevent duplicate profile

    return render(request, 'job_seeker/create_js_profile.html', {'debug': False,})

class SkillListAPIView(generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class JobSeekerProfileCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = JobSeekerProfileSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            print(serializer.errors)  # or use logging
        if serializer.is_valid():
            profile = serializer.save()
            return Response({'message': 'Profile created'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def create_job_seeker_profile(request):
    user = request.user
    # Redirect if profile already exists
    if hasattr(user, 'job_seeker_profile'):
        return redirect('user:profile')  # ✅ Fix applied here

    if request.method == 'POST':
        form = JobSeekerProfileForm(request.POST, request.FILES)
        if form.is_valid():
            profile = form.save(commit=False)
            profile.user = user
            profile.save()
            return redirect('job_seeker_dashboard')
    else:
        form = JobSeekerProfileForm()
        edu_formset = EducationForm()
        cert_formset = CertificationForm()
        exp_formset = JobExperienceForm()

    return render(request, 'job_seeker/create_js_profile.html', {'job_seeker_form': form, 'edu_formset': edu_formset, 'cert_formset': cert_formset, 'exp_formset': exp_formset,})

def job_seeker_dashboard(request):
    profile = get_object_or_404(JobSeekerProfile, user=request.user)
    return render(request, 'job_seeker/dashboard.html', {'profile': profile})