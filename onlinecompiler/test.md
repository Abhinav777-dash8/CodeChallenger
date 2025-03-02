I'll create Postman examples for testing all the APIs in your Django online compiler application. These examples will cover authentication, code compilation, coding challenges, and user management.

# 1. User Authentication APIs

## Signup

```
POST http://localhost:8000/api/signup/
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123"
}
```

## Login

```
POST http://localhost:8000/api/login/
Content-Type: application/json

{
  "username": "testuser",
  "password": "securepassword123"
}
```
Response will include `access` and `refresh` tokens you'll need for other requests.

## Token Refresh

```
POST http://localhost:8000/api/token/refresh/
Content-Type: application/json

{
  "refresh": "your_refresh_token_here"
}
```

# 2. Code Compilation API

## Compile Code

```
POST http://localhost:8000/api/compile/
Content-Type: application/json
Authorization: Bearer your_access_token_here

{
  "code": "print('Hello, World!')",
  "language": "python",
  "stdin": ""
}
```

For Java:
```
POST http://localhost:8000/api/compile/
Content-Type: application/json
Authorization: Bearer your_access_token_here

{
  "code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}",
  "language": "java",
  "stdin": ""
}
```

For C++:
```
POST http://localhost:8000/api/compile/
Content-Type: application/json
Authorization: Bearer your_access_token_here

{
  "code": "#include <iostream>\n\nint main() {\n  std::cout << \"Hello, World!\" << std::endl;\n  return 0;\n}",
  "language": "cpp",
  "stdin": ""
}
```

# 3. Coding Challenges APIs

## List All Challenges

```
GET http://localhost:8000/api/challenges/
Authorization: Bearer your_access_token_here
```

## Create Challenge (Admin/Superuser Only)

```
POST http://localhost:8000/api/challenges/
Content-Type: application/json
Authorization: Bearer your_admin_access_token_here

{
  "title": "Sum of Two Numbers",
  "description": "Write a program that reads two integers from stdin and prints their sum to stdout.",
  "example_input": "5 7",
  "example_output": "12",
  "test_cases": [
    {
      "input": "5 7",
      "output": "12"
    },
    {
      "input": "10 20",
      "output": "30"
    },
    {
      "input": "-3 5",
      "output": "2"
    }
  ],
  "difficulty": "easy",
  "is_active": true
}
```

## Get Challenge Details

```
GET http://localhost:8000/api/challenges/1/
Authorization: Bearer your_access_token_here
```

## Update Challenge (Admin/Superuser Only)

```
PUT http://localhost:8000/api/challenges/1/
Content-Type: application/json
Authorization: Bearer your_admin_access_token_here

{
  "title": "Updated Challenge Title",
  "description": "Updated description",
  "example_input": "5 7",
  "example_output": "12",
  "test_cases": [
    {
      "input": "5 7",
      "output": "12"
    },
    {
      "input": "10 20",
      "output": "30"
    }
  ],
  "difficulty": "medium",
  "is_active": true
}
```

## Delete Challenge (Admin/Superuser Only)

```
DELETE http://localhost:8000/api/challenges/1/
Authorization: Bearer your_admin_access_token_here
```

## Submit Solution for a Challenge

```
POST http://localhost:8000/api/challenges/1/solve/
Content-Type: application/json
Authorization: Bearer your_access_token_here

{
  "code": "a, b = map(int, input().split())\nprint(a + b)",
  "language": "python"
}
```

Java solution:
```
POST http://localhost:8000/api/challenges/1/solve/
Content-Type: application/json
Authorization: Bearer your_access_token_here

{
  "code": "import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner scanner = new Scanner(System.in);\n    int a = scanner.nextInt();\n    int b = scanner.nextInt();\n    System.out.println(a + b);\n  }\n}",
  "language": "java"
}
```

C++ solution:
```
POST http://localhost:8000/api/challenges/1/solve/
Content-Type: application/json
Authorization: Bearer your_access_token_here

{
  "code": "#include <iostream>\n\nint main() {\n  int a, b;\n  std::cin >> a >> b;\n  std::cout << a + b << std::endl;\n  return 0;\n}",
  "language": "cpp"
}
```

# 4. User Information APIs

## View Leaderboard

```
GET http://localhost:8000/api/leaderboard/
Authorization: Bearer your_access_token_here
```

## View My Solutions

```
GET http://localhost:8000/api/my-solutions/
Authorization: Bearer your_access_token_here
```

# Testing Workflow

1. Start by creating a user with the Signup API
2. Login to get the access token
3. Use the access token for all authenticated requests
4. Create coding challenges (as admin)
5. List available challenges
6. Submit solutions to challenges
7. Check the leaderboard
8. View your solution history

If you need to test with an admin user, you can create a superuser with:
```
python manage.py createsuperuser
```
And then login with those credentials to get an admin access token.