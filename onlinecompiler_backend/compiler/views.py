from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from django.db.models import Count
from django.conf import settings

from .models import Submission
from .serializers import (
    SignupSerializer,
    SubmissionSerializer,
    UserSerializer
)

import subprocess
import tempfile
import os

# ----- Signup -----
class SignupView(APIView):
    permission_classes = [permissions.AllowAny]  # anyone can sign up

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----- Compile Code View (Requires JWT) -----
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
                    input=user_input,
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
                        # compilation error
                        result_data = {
                            "stdout": compile_proc.stdout,
                            "stderr": compile_proc.stderr,
                            "returncode": compile_proc.returncode
                        }
                    else:
                        run_proc = subprocess.run(
                            ["java", "-cp", tmpdir, "Main"],
                            input=user_input,
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
                        # compilation error
                        result_data = {
                            "stdout": compile_proc.stdout,
                            "stderr": compile_proc.stderr,
                            "returncode": compile_proc.returncode
                        }
                    else:
                        run_proc = subprocess.run(
                            [exe_file],
                            input=user_input,
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

        # Save submission to DB
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


# ----- Leaderboard (Requires JWT) -----
class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Annotate each user with submission count
        users = User.objects.annotate(programs_executed=Count('submissions')).order_by('-programs_executed')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
