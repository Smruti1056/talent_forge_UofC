from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .forms import JobSeekerProfileForm, EducationForm, CertificationForm, JobExperienceForm
from .models import JobSeekerProfile, Skill
from rest_framework import generics
from django.conf import settings 
from django.http import JsonResponse
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import JobSeekerProfileSerializer, SkillSerializer, JobSeekerProfileCreateSerializer

@login_required
def jobseeker_profile_page(request):
    if hasattr(request.user, 'job_seeker_profile'):
        return redirect('job_seeker_dashboard')  # Prevent duplicate profile

    return render(request, 'job_seeker/create_js_profile.html')

class SkillListAPIView(generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class JobSeekerProfileCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = JobSeekerProfileCreateSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            print(serializer.errors)
        if serializer.is_valid():
            profile = serializer.save()
            return Response({'message': 'Profile created'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@login_required
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

    return render(request, 'job_seeker/create_js_profile.html')

@login_required
def job_seeker_dashboard(request):
    profile = get_object_or_404(JobSeekerProfile, user=request.user)
    return render(request, 'job_seeker/dashboard.html', {'profile': profile})

class JobSeekerProfileDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = JobSeekerProfile.objects.get(user=request.user)
        except JobSeekerProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)
        
        serializer = JobSeekerProfileSerializer(profile)
        return Response(serializer.data)

@login_required
def employer_profile_api(request):
    profile = get_object_or_404(JobSeekerProfile, user=request.user)
    print(profile)
    data = {
        'first_name': profile.first_name,
        'last_name': profile.last_name,
        'email': profile.email,
        'about': profile.about,
    }
    return JsonResponse(data)