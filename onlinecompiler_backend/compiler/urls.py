# compiler/urls.py
from django.urls import path
from .views import CompileCodeView

urlpatterns = [
    path('compile/', CompileCodeView.as_view(), name='compile'),
]
