from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from django.contrib.auth.models import User
from django.db.models import Count
from django.conf import settings
from django.db import transaction
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Submission, CodingChallenge, ChallengeSolution, UserProfile
from .serializers import (
    SignupSerializer,
    SubmissionSerializer,
    UserSerializer,
    CodingChallengeSerializer,
    ChallengeSolutionSerializer
)

import subprocess
import tempfile
import os
import json

# ----- Custom Token Serializer -----
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        try:
            profile = self.user.profile
            data['points'] = profile.points
        except:
            data['points'] = 0
        return data

# ----- Login View -----
class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

# ----- Custom Permissions -----
class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser

# ----- Signup -----
class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ----- Compile Code View (Fixed input handling) -----
class CompileCodeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get("code", "")
        language = request.data.get("language", "python").lower()
        user_input = request.data.get("stdin", "")

        result_data = {}
        try:
            if language == "python":
                with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as tmp_file:
                    tmp_file.write(code.encode())
                    tmp_filename = tmp_file.name
                result = subprocess.run(
                    ["python", tmp_filename],
                    input=user_input,  # Fixed: removed .encode()
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                os.remove(tmp_filename)
                result_data = {
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "returncode": result.returncode
                }

            elif language == "java":
                with tempfile.TemporaryDirectory() as tmpdir:
                    java_file = os.path.join(tmpdir, "Main.java")
                    with open(java_file, "w") as f:
                        f.write(code)
                    compile_proc = subprocess.run(
                        ["javac", java_file],
                        capture_output=True, text=True
                    )
                    if compile_proc.returncode != 0:
                        result_data = {
                            "stdout": compile_proc.stdout,
                            "stderr": compile_proc.stderr,
                            "returncode": compile_proc.returncode
                        }
                    else:
                        run_proc = subprocess.run(
                            ["java", "-cp", tmpdir, "Main"],
                            input=user_input,  # Fixed: removed .encode()
                            capture_output=True, text=True,
                            timeout=5
                        )
                        result_data = {
                            "stdout": run_proc.stdout,
                            "stderr": run_proc.stderr,
                            "returncode": run_proc.returncode
                        }

            elif language in ["c++", "cpp"]:
                with tempfile.TemporaryDirectory() as tmpdir:
                    cpp_file = os.path.join(tmpdir, "main.cpp")
                    with open(cpp_file, "w") as f:
                        f.write(code)
                    exe_file = os.path.join(tmpdir, "main.out")
                    compile_proc = subprocess.run(
                        ["g++", cpp_file, "-o", exe_file],
                        capture_output=True, text=True
                    )
                    if compile_proc.returncode != 0:
                        result_data = {
                            "stdout": compile_proc.stdout,
                            "stderr": compile_proc.stderr,
                            "returncode": compile_proc.returncode
                        }
                    else:
                        run_proc = subprocess.run(
                            [exe_file],
                            input=user_input,  # Fixed: removed .encode()
                            capture_output=True, text=True,
                            timeout=5
                        )
                        result_data = {
                            "stdout": run_proc.stdout,
                            "stderr": run_proc.stderr,
                            "returncode": run_proc.returncode
                        }
            else:
                return Response({"error": "Unsupported language."}, status=status.HTTP_400_BAD_REQUEST)

        except subprocess.TimeoutExpired:
            return Response({"error": f"{language.capitalize()} code execution timed out."}, status=status.HTTP_408_REQUEST_TIMEOUT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        submission = Submission.objects.create(
            user=request.user,
            language=language,
            code=code,
            stdin=user_input,
            stdout=result_data.get("stdout", ""),
            stderr=result_data.get("stderr", ""),
            returncode=result_data.get("returncode", 0)
        )

        submission_data = SubmissionSerializer(submission).data
        return Response({"result": result_data, "submission": submission_data})

# ----- Leaderboard -----
class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(profile__isnull=False).order_by('-profile__points')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

# ----- Coding Challenges Views -----
class CodingChallengeListCreate(generics.ListCreateAPIView):
    serializer_class = CodingChallengeSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsSuperUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return CodingChallenge.objects.all()
        return CodingChallenge.objects.filter(is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        
class CodingChallengeDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CodingChallengeSerializer
    lookup_field = 'pk'
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsSuperUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return CodingChallenge.objects.all()
        return CodingChallenge.objects.filter(is_active=True)

# ----- Challenge Solution Execution (Fixed input handling) -----
class ChallengeSolutionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def execute_code(self, code, language, input_data):
        result_data = {}
        try:
            if language == "python":
                with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as tmp_file:
                    tmp_file.write(code.encode())
                    tmp_filename = tmp_file.name
                result = subprocess.run(
                    ["python", tmp_filename],
                    input=input_data,  # Fixed: removed .encode()
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                os.remove(tmp_filename)
                result_data = {
                    "stdout": result.stdout.strip(),
                    "stderr": result.stderr,
                    "returncode": result.returncode
                }

            elif language == "java":
                with tempfile.TemporaryDirectory() as tmpdir:
                    java_file = os.path.join(tmpdir, "Main.java")
                    with open(java_file, "w") as f:
                        f.write(code)
                    compile_proc = subprocess.run(
                        ["javac", java_file],
                        capture_output=True, text=True
                    )
                    if compile_proc.returncode != 0:
                        result_data = {
                            "stdout": "",
                            "stderr": compile_proc.stderr,
                            "returncode": compile_proc.returncode
                        }
                    else:
                        run_proc = subprocess.run(
                            ["java", "-cp", tmpdir, "Main"],
                            input=input_data,  # Fixed: removed .encode()
                            capture_output=True, text=True,
                            timeout=5
                        )
                        result_data = {
                            "stdout": run_proc.stdout.strip(),
                            "stderr": run_proc.stderr,
                            "returncode": run_proc.returncode
                        }

            elif language in ["c++", "cpp"]:
                with tempfile.TemporaryDirectory() as tmpdir:
                    cpp_file = os.path.join(tmpdir, "main.cpp")
                    with open(cpp_file, "w") as f:
                        f.write(code)
                    exe_file = os.path.join(tmpdir, "main.out")
                    compile_proc = subprocess.run(
                        ["g++", cpp_file, "-o", exe_file],
                        capture_output=True, text=True
                    )
                    if compile_proc.returncode != 0:
                        result_data = {
                            "stdout": "",
                            "stderr": compile_proc.stderr,
                            "returncode": compile_proc.returncode
                        }
                    else:
                        run_proc = subprocess.run(
                            [exe_file],
                            input=input_data,  # Fixed: removed .encode()
                            capture_output=True, text=True,
                            timeout=5
                        )
                        result_data = {
                            "stdout": run_proc.stdout.strip(),
                            "stderr": run_proc.stderr,
                            "returncode": run_proc.returncode
                        }
            else:
                result_data = {"error": "Unsupported language."}
                
        except subprocess.TimeoutExpired:
            result_data = {"error": f"{language.capitalize()} code execution timed out."}
        except Exception as e:
            result_data = {"error": str(e)}
            
        return result_data
    
    @transaction.atomic
    def post(self, request, challenge_id):
        try:
            challenge = CodingChallenge.objects.get(pk=challenge_id, is_active=True)
        except CodingChallenge.DoesNotExist:
            return Response({"error": "Challenge not found or inactive."}, status=status.HTTP_404_NOT_FOUND)
            
        code = request.data.get("code", "")
        language = request.data.get("language", "python").lower()
        test_cases = challenge.test_cases
        
        if not test_cases:
            return Response({"error": "No test cases available for this challenge."}, status=status.HTTP_400_BAD_REQUEST)
            
        all_passed = True
        test_results = []
        
        for i, test_case in enumerate(test_cases):
            input_data = test_case.get("input", "")
            expected_output = test_case.get("output", "").strip()
            
            result = self.execute_code(code, language, input_data)
            
            if "error" in result:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
                
            actual_output = result.get("stdout", "").strip()
            test_passed = actual_output == expected_output and result.get("returncode") == 0
            
            if not test_passed:
                all_passed = False
                
            if i == 0 or request.user.is_superuser:
                test_results.append({
                    "test_case": i + 1,
                    "passed": test_passed,
                    "input": input_data,
                    "expected_output": expected_output,
                    "actual_output": actual_output
                })
            else:
                test_results.append({"test_case": i + 1, "passed": test_passed})
        
        solution, created = ChallengeSolution.objects.update_or_create(
            user=request.user,
            challenge=challenge,
            defaults={"code": code, "language": language, "is_correct": all_passed}
        )
        
        if all_passed and created:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            profile.points += 1
            profile.save()
            
        solution_data = ChallengeSolutionSerializer(solution).data
        
        return Response({
            "solution": solution_data,
            "all_tests_passed": all_passed,
            "test_results": test_results
        })

# ----- User Solutions -----
class UserSolutionsView(generics.ListAPIView):
    serializer_class = ChallengeSolutionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChallengeSolution.objects.filter(user=self.request.user)