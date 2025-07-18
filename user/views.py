import io
import base64
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth  import get_user_model
from django.conf import settings
from .models import CustomUser
from employeer.models import EmployerProfile
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
import pyotp
import qrcode

CustomUser = get_user_model()

def generate_otp(user):
    if not user.mfa_secret:
        user.mfa_secret = pyotp.random_base32()
        user.save()
    otp_uri = pyotp.totp.TOTP(user.mfa_secret).provisioning_uri(
        name=user.email,
        issuer_name="Employment Placement App"
    )
    qr = qrcode.make(otp_uri)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)  
    qr_code = base64.b64encode(buffer.getvalue()).decode("utf-8")
    qr_code_data_uri = f"data:image/png;base64,{qr_code}"

    return qr_code_data_uri

def verify_2fa_otp(user, otp):
    totp = pyotp.TOTP(user.mfa_secret)
    if totp.verify(otp):
        user.mfa_enabled = True
        user.save()

        return True

    return False

def home_view(request):
    return render(request, 'home.html')

@login_required
def profile_view(request):
    user = request.user
    if user.user_type == '2':
        if not hasattr(user, 'employer_profile'):
            return redirect('create_employer_profile')
        else:
           return redirect('employer_dashboard')
    elif user.user_type == '1':
        if not hasattr(user, 'jobseekerprofile'):
            return redirect('create_jobseeker_profile')
    qr_code_data_uri = generate_otp(user)
    is_employer = hasattr(user, 'employerprofile')

    return render(request, 'profile.html', {"qrcode": qr_code_data_uri})

def activate_mfa(request):
    user_id = request.session.get('mfa_user_id')
    if not user_id:
        return redirect('error')
    user = get_object_or_404(CustomUser, id=user_id)
    qr_code_data_uri = generate_otp(user)

    return render(request, 'otp_activate.html', {"qrcode": qr_code_data_uri, "user_id_mfa": user_id})

def verify_mfa(request):
    if request.method == 'POST':
        otp = request.POST.get('otp_code')
        user_id = request.POST.get('user_id')
        if not user_id:
            messages.error(request, 'Invalid parameters. Please try again.')

            return render(request,'otp_verify.html', {'user_id': user_id})
        user = get_object_or_404(CustomUser, id=user_id)
        if verify_2fa_otp(user, otp):
            if request.user.is_authenticated:
                messages.success(request, '2FA enabled successfully !')

                return redirect('profile')
            login(request, user)
            messages.success(request, 'Login successful!')
            return redirect('profile')
        else:
            if request.user.is_authenticated:
                messages.error(request, 'Invalid OTP code. Please try again.')

                return redirect('profile')
            messages.error(request, 'Invalid OTP code. Please try again.')

            return render(request,'otp_verify.html', {'user_id': user_id})
       
    return render(request,'otp_verify.html', {'user_id': user_id})

@login_required
def disable_2fa(request):
    user = request.user
    if user.mfa_enabled:
        user.mfa_enabled = False
        user.save()
        messages.success(request, "Two-Factor Authentication has been disabled.")
 
        return redirect('profile')
    else:
        messages.info(request, "2FA is already disabled.")

    return redirect('profile')

def login_page(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')        
        user = authenticate(request, username=email, password=password)
        if user is not None:
            if user.mfa_enabled:

                return render(request,'otp_verify.html', {'user_id': user.id})
            login(request, user)
            messages.success(request, 'Login successful!')

            return redirect('profile') 
        else:
            messages.error(request, 'Invalid email or password. Please try again.')

    return render(request,'login.html')

@login_required
def logout_page(request):
    logout(request)  
    messages.success(request, 'You have been logged out successfully.') 

    return redirect('/')


def signup_view(request, user_type):
    context = {
        'user_type': user_type
    }
    if request.method == 'POST':
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')        
        # Check if passwords match
        if password1 != password2:
            messages.error(request, 'Passwords do not match. Please try again.')
            return render(request, 'signup.html', context)
        # Check if email is already taken
        if CustomUser.objects.filter(email=email).exists():
            messages.error(request, 'Email is already in use. Please try another.')
            return render(request, 'signup.html', context)
        # Create the new user
        user = CustomUser.objects.create_user(username=email, email=email, password=password1, mfa_enabled = True, user_type=user_type)
        user.save()
        messages.success(request, 'Sign up successful! You can now activate the MFA in your account.')
        request.session['mfa_user_id'] = user.id

        return redirect('activate_mfa')

    return render(request, 'signup.html', context)