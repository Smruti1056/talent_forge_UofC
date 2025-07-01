from django.contrib import admin
from django.urls import path , include
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('home', views.home_view, name='home'), # Your home page
    #path('admin/', admin.site.urls),
    path("",include('user.urls')),
    path("",include('allauth.urls')),
    path("",include('employer.urls')),
    path("",include('job_seeker.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)