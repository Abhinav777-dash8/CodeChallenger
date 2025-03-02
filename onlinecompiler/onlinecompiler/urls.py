from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from compiler.views import (
    SignupView, CompileCodeView, LeaderboardView,
    CodingChallengeListCreate, CodingChallengeDetail,
    ChallengeSolutionView, UserSolutionsView,
    LoginView, TokenObtainPairView # Import our new LoginView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/', LoginView.as_view(), name='login'),  # New login endpoint

    # User endpoints
    path('api/signup/', SignupView.as_view(), name='signup'),
    path('api/compile/', CompileCodeView.as_view(), name='compile'),
    path('api/leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    
    # Challenge endpoints
    path('api/challenges/', CodingChallengeListCreate.as_view(), name='challenges'),
    path('api/challenges/<int:pk>/', CodingChallengeDetail.as_view(), name='challenge-detail'),
    path('api/challenges/<int:challenge_id>/solve/', ChallengeSolutionView.as_view(), name='solve-challenge'),
    
    # User solutions
    path('api/my-solutions/', UserSolutionsView.as_view(), name='my-solutions'),
    
    # Include compiler URLs
    path('api/', include('compiler.urls')),
]