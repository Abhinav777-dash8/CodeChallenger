from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from compiler.views import (
    SignupView, CompileCodeView, LeaderboardView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Our endpoints
    path('api/signup/', SignupView.as_view(), name='signup'),
    path('api/compile/', CompileCodeView.as_view(), name='compile'),
    path('api/leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]
