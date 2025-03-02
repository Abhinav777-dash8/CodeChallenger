# Online Compiler and Coding Challenge Platform

An interactive platform for code execution, programming challenges, and competitive coding built with Django REST Framework and modern frontend technologies.

## 🚀 Features

- **Multi-language Code Execution**: Run code in Python, Java, and C++ with input/output support
- **User Authentication**: Secure JWT-based authentication system
- **Coding Challenges**: Create and solve programming challenges with automated testing
- **Leaderboard System**: Track progress and compete with other users
- **Detailed Analytics**: Monitor your performance and coding history

## 📋 Requirements

### Backend (Python/Django)
- Python 3.10+
- Django 4.0+
- Django REST Framework
- django-rest-framework-simplejwt
- Gunicorn (for production)

### Frontend (Recommended)
- React/Vue/Angular
- Code editor component (Monaco Editor or CodeMirror)
- Axios or Fetch API for HTTP requests
- React Router or equivalent for routing

### System Requirements
- Linux/macOS/Windows with Python support
- Docker (optional, for containerized deployment)
- Compilers/interpreters for supported languages:
  - Python 3.x
  - JDK 17+
  - GCC/G

# Online Compiler API Documentation

This documentation provides a comprehensive guide for frontend developers to integrate with the Online Compiler platform's backend APIs. The platform offers code execution, user authentication, coding challenges, and a competitive leaderboard system.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
   - [Signup](#signup)
   - [Login](#login)
   - [Token Refresh](#token-refresh)
4. [Code Compilation](#code-compilation)
   - [Execute Code](#execute-code)
5. [Coding Challenges](#coding-challenges)
   - [List All Challenges](#list-all-challenges)
   - [Get Challenge Details](#get-challenge-details)
   - [Create Challenge](#create-challenge)
   - [Update Challenge](#update-challenge)
   - [Delete Challenge](#delete-challenge)
   - [Submit Solution](#submit-solution)
6. [User Management](#user-management)
   - [View Leaderboard](#view-leaderboard)
   - [View User Solutions](#view-user-solutions)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
10. [Development Workflow](#development-workflow)

## Introduction

The Online Compiler platform provides a RESTful API for executing code in multiple programming languages (Python, Java, C++), managing users, and handling coding challenges with automated testing.

**Supported Languages:**
- Python
- Java
- C++ (cpp)

**Key Features:**
- User authentication with JWT tokens
- Code execution with input/output support
- Coding challenges with automated test cases
- Leaderboard system based on challenge completion

## Getting Started

### Base URL

All API requests should be prefixed with:
```
http://localhost:8000/api/
```

For production, replace with your domain.

### Headers

Most API endpoints require authentication with a JWT token:

```
Authorization: Bearer <your_access_token>
```

Content type for requests:
```
Content-Type: application/json
```

## Authentication

### Signup

Register a new user account.

**Endpoint:** `POST /api/signup/`

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully."
}
```

**Error Response (400 Bad Request):**
```json
{
  "username": ["A user with that username already exists."],
  "password": ["This password is too common."]
}
```

### Login

Authenticate a user and retrieve access and refresh tokens.

**Endpoint:** `POST /api/login/`

**Request Body:**
```json
{
  "username": "testuser",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser",
  "points": 5
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "No active account found with the given credentials"
}
```

### Token Refresh

Renew an expired access token using a valid refresh token.

**Endpoint:** `POST /api/token/refresh/`

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

### Token Management

Store tokens securely using localStorage or secure cookies:

```javascript
// After successful login
localStorage.setItem('accessToken', response.access);
localStorage.setItem('refreshToken', response.refresh);

// For API requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
};
```

## Code Compilation

### Execute Code

Compile and execute code in the supported languages.

**Endpoint:** `POST /api/compile/`

**Authentication:** Required

**Request Body:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python",
  "stdin": ""
}
```

Example with input:
```json
{
  "code": "n = int(input())\nprint(n * 2)",
  "language": "python",
  "stdin": "21"
}
```

Java Example:
```json
{
  "code": "import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}",
  "language": "java",
  "stdin": ""
}
```

C++ Example:
```json
{
  "code": "#include <iostream>\n\nint main() {\n  std::cout << \"Hello, World!\" << std::endl;\n  return 0;\n}",
  "language": "cpp",
  "stdin": ""
}
```

**Response (200 OK):**
```json
{
  "result": {
    "stdout": "Hello, World!",
    "stderr": "",
    "returncode": 0
  },
  "submission": {
    "id": 1,
    "user": 1,
    "language": "python",
    "code": "print('Hello, World!')",
    "stdin": "",
    "stdout": "Hello, World!",
    "stderr": "",
    "returncode": 0,
    "created_at": "2025-03-02T12:34:56.789Z"
  }
}
```

**Error Responses:**

Timeout (408):
```json
{
  "error": "Python code execution timed out."
}
```

Language not supported (400):
```json
{
  "error": "Unsupported language."
}
```

Server Error (500):
```json
{
  "error": "'bytes' object has no attribute 'encode'"
}
```

## Coding Challenges

### List All Challenges

Retrieve all available coding challenges.

**Endpoint:** `GET /api/challenges/`

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Sum of Two Numbers",
    "description": "Write a program that reads two integers from stdin and prints their sum to stdout.",
    "example_input": "5 7",
    "example_output": "12",
    "difficulty": "easy",
    "created_at": "2025-03-01T10:30:00Z",
    "created_by": "admin",
    "is_active": true
  },
  {
    "id": 2,
    "title": "Fibonacci Sequence",
    "description": "Write a program that generates the first n numbers of the Fibonacci sequence.",
    "example_input": "5",
    "example_output": "0 1 1 2 3",
    "difficulty": "medium",
    "created_at": "2025-03-01T11:45:00Z",
    "created_by": "admin",
    "is_active": true
  }
]
```

Note: Regular users won't see the `test_cases` field in the response.

### Get Challenge Details

Retrieve details for a specific challenge.

**Endpoint:** `GET /api/challenges/{challenge_id}/`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Sum of Two Numbers",
  "description": "Write a program that reads two integers from stdin and prints their sum to stdout.",
  "example_input": "5 7",
  "example_output": "12",
  "difficulty": "easy",
  "created_at": "2025-03-01T10:30:00Z",
  "created_by": "admin",
  "is_active": true
}
```

For admin users, the response will also include test cases:
```json
{
  "id": 1,
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
  "created_at": "2025-03-01T10:30:00Z",
  "created_by": "admin",
  "is_active": true
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Not found."
}
```

### Create Challenge

Create a new coding challenge (admin/superuser only).

**Endpoint:** `POST /api/challenges/`

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "Prime Numbers",
  "description": "Write a program that checks if a given number is prime.",
  "example_input": "7",
  "example_output": "Prime",
  "test_cases": [
    {
      "input": "7",
      "output": "Prime"
    },
    {
      "input": "12",
      "output": "Not Prime"
    },
    {
      "input": "2",
      "output": "Prime"
    }
  ],
  "difficulty": "medium",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "title": "Prime Numbers",
  "description": "Write a program that checks if a given number is prime.",
  "example_input": "7",
  "example_output": "Prime",
  "test_cases": [
    {
      "input": "7",
      "output": "Prime"
    },
    {
      "input": "12",
      "output": "Not Prime"
    },
    {
      "input": "2",
      "output": "Prime"
    }
  ],
  "difficulty": "medium",
  "created_at": "2025-03-02T14:20:30Z",
  "created_by": "admin",
  "is_active": true
}
```

**Error Response (403 Forbidden):**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Update Challenge

Update an existing challenge (admin/superuser only).

**Endpoint:** `PUT /api/challenges/{challenge_id}/`

**Authentication:** Required (Admin)

**Request Body:**
```json
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

**Response (200 OK):**
```json
{
  "id": 1,
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
  "created_at": "2025-03-01T10:30:00Z",
  "created_by": "admin",
  "is_active": true
}
```

### Delete Challenge

Delete a challenge (admin/superuser only).

**Endpoint:** `DELETE /api/challenges/{challenge_id}/`

**Authentication:** Required (Admin)

**Response (204 No Content):**
Empty response with 204 status code.

### Submit Solution

Submit a solution for a specific challenge and run it against test cases.

**Endpoint:** `POST /api/challenges/{challenge_id}/solve/`

**Authentication:** Required

**Request Body:**
```json
{
  "code": "a, b = map(int, input().split())\nprint(a + b)",
  "language": "python"
}
```

**Response (200 OK):**
```json
{
  "solution": {
    "id": 1,
    "username": "testuser",
    "challenge": 1,
    "challenge_title": "Sum of Two Numbers",
    "code": "a, b = map(int, input().split())\nprint(a + b)",
    "language": "python",
    "is_correct": true,
    "created_at": "2025-03-02T15:30:45Z"
  },
  "all_tests_passed": true,
  "test_results": [
    {
      "test_case": 1,
      "passed": true,
      "input": "5 7",
      "expected_output": "12",
      "actual_output": "12"
    }
  ]
}
```

Note: For regular users, only the first test case (example) shows full details; for additional test cases, only the pass/fail status is shown.

**Error Response (404 Not Found):**
```json
{
  "error": "Challenge not found or inactive."
}
```

## User Management

### View Leaderboard

Get a list of users sorted by points earned from solving challenges.

**Endpoint:** `GET /api/leaderboard/`

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "username": "topuser",
    "email": "top@example.com",
    "points": 15,
    "programs_executed": 45,
    "challenges_completed": 15
  },
  {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "points": 10,
    "programs_executed": 32,
    "challenges_completed": 10
  }
]
```

### View User Solutions

Get all solutions submitted by the authenticated user.

**Endpoint:** `GET /api/my-solutions/`

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "testuser",
    "challenge": 1,
    "challenge_title": "Sum of Two Numbers",
    "code": "a, b = map(int, input().split())\nprint(a + b)",
    "language": "python",
    "is_correct": true,
    "created_at": "2025-03-02T15:30:45Z"
  },
  {
    "id": 2,
    "username": "testuser",
    "challenge": 2,
    "challenge_title": "Fibonacci Sequence",
    "code": "n = int(input())\nfib = [0, 1]\nfor i in range(2, n):\n    fib.append(fib[i-1] + fib[i-2])\nprint(' '.join(map(str, fib[:n])))",
    "language": "python",
    "is_correct": true,
    "created_at": "2025-03-02T16:20:15Z"
  }
]
```

## Error Handling

The API uses standard HTTP status codes:

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **204 No Content**: Successful request with no response body
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource not found
- **408 Request Timeout**: Code execution timeout
- **500 Internal Server Error**: Server-side error

Example of client-side error handling:

```javascript
async function compileCode(code, language, stdin) {
  try {
    const response = await fetch('http://localhost:8000/api/compile/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, language, stdin })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Handle token expiration
        await refreshToken();
        return compileCode(code, language, stdin);
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || 'Something went wrong');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Compilation error:', error);
    // Show user-friendly error message
    return { error: error.message };
  }
}
```

## Best Practices

### Token Management

1. **Store tokens securely:**
   - Use secure HttpOnly cookies if possible
   - For SPAs, use localStorage with appropriate security measures

2. **Token Refresh Strategy:**
   - Implement automatic token refresh when receiving 401 responses
   - Refresh the token before it expires to avoid interruptions

```javascript
// Automatic token refresh
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  
  try {
    const response = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken })
    });
    
    if (!response.ok) {
      // If refresh fails, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return false;
    }
    
    const data = await response.json();
    localStorage.setItem('accessToken', data.access);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}
```

### API Request Helper

Create a reusable fetch wrapper to handle authentication and errors:

```javascript
async function apiRequest(endpoint, options = {}) {
  // Set default headers with authentication
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add authentication token if available
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Make the request
  try {
    const response = await fetch(`http://localhost:8000/api/${endpoint}`, {
      ...options,
      headers
    });
    
    // Handle 401 Unauthorized (token expired)
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the request with new token
        return apiRequest(endpoint, options);
      } else {
        throw new Error('Authentication required');
      }
    }
    
    // Parse JSON response if applicable
    if (response.status !== 204) { // No content
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Request failed');
      }
      
      return data;
    }
    
    return null; // For 204 responses
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Usage examples
const challenges = await apiRequest('challenges/');
const compilationResult = await apiRequest('compile/', {
  method: 'POST',
  body: JSON.stringify({
    code: 'print("Hello")',
    language: 'python',
    stdin: ''
  })
});
```

### Code Editor Integration

For the code editor component, consider using Monaco Editor (VS Code's editor) or CodeMirror:

```javascript
// Using CodeMirror 6 example
import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup';
import { python } from '@codemirror/lang-python';

function setupEditor(container, initialCode = '') {
  return new EditorView({
    state: EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        python(),
        EditorView.theme({
          '&': { height: '400px' },
          '.cm-scroller': { overflow: 'auto' }
        })
      ]
    }),
    parent: container
  });
}

// Get code from editor
function getCode(editorView) {
  return editorView.state.doc.toString();
}

// In your component
const editorContainer = document.getElementById('editor');
const editor = setupEditor(editorContainer, 'print("Hello, World!")');

// When submitting code
document.getElementById('submit-btn').addEventListener('click', async () => {
  const code = getCode(editor);
  const language = document.getElementById('language-select').value;
  const stdin = document.getElementById('stdin').value;
  
  try {
    const result = await apiRequest('compile/', {
      method: 'POST',
      body: JSON.stringify({ code, language, stdin })
    });
    
    // Display result
    document.getElementById('output').textContent = result.result.stdout;
    document.getElementById('error').textContent = result.result.stderr;
  } catch (error) {
    document.getElementById('error').textContent = error.message;
  }
});
```

## Common Issues & Troubleshooting

### CORS Issues

If you're developing the frontend on a different port or domain, you might encounter CORS errors. Ensure the Django backend is configured to allow your frontend origin:

In Django settings.py:
```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # other middleware...
]

# Allow requests from your frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React default
    "http://localhost:8080",  # Vue default
]
```

### Authentication Issues

1. **Token expired errors**: Implement the token refresh strategy described above.

2. **Cannot access protected routes**: Ensure you're including the Authorization header with every request:
   ```javascript
   headers: {
     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
   }
   ```

3. **Logout strategy**: Clear tokens and redirect to login:
   ```javascript
   function logout() {
     localStorage.removeItem('accessToken');
     localStorage.removeItem('refreshToken');
     window.location.href = '/login';
   }
   ```

### Code Execution Issues

1. **Timeouts**: Handle timeout errors gracefully:
   ```javascript
   if (error.message.includes('timed out')) {
     showMessage('Your code execution timed out. Check for infinite loops or optimize your solution.');
   }
   ```

2. **Memory issues**: Inform users about potential memory limitations:
   ```javascript
   if (error.message.includes('memory')) {
     showMessage('Your code exceeded memory limits. Try optimizing your solution.');
   }
   ```

## Development Workflow

Here's a recommended workflow for integrating with the API:

1. **Setup authentication first**:
   - Implement login/signup
   - Set up token storage and refresh mechanisms
   - Create protected routes in your frontend

2. **Create a code playground**:
   - Implement the code editor
   - Add language selection dropdown
   - Create input/output panels
   - Connect to the compile endpoint

3. **Add challenges section**:
   - Fetch and display available challenges
   - Create a challenge details page
   - Implement the solution submission flow
   - Display test results

4. **User dashboard**:
   - Show user profile info and points
   - Display solutions history
   - Add leaderboard view

### Example Integration Flow (React)

```jsx
// Example of a challenge detail page in React
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';

const ChallengeDetail = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch challenge details
  useEffect(() => {
    async function fetchChallenge() {
      try {
        const data = await apiRequest(`challenges/${id}/`);
        setChallenge(data);
        
        // Set starter code based on language
        if (language === 'python') {
          setCode('# Write your solution here\n\n');
        } else if (language === 'java') {
          setCode('public class Main {\n  public static void main(String[] args) {\n    // Write your solution here\n  }\n}');
        } else if (language === 'cpp') {
          setCode('#include <iostream>\n\nint main() {\n  // Write your solution here\n  return 0;\n}');
        }
      } catch (err) {
        setError('Failed to load challenge');
      }
    }
    
    fetchChallenge();
  }, [id]);
  
  // Get the appropriate language extension for CodeMirror
  const getLanguageExtension = () => {
    switch (language) {
      case 'python': return python();
      case 'java': return java();
      case 'cpp': return cpp();
      default: return python();
    }
  };
  
  // Handle code submission
  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    
    try {
      const data = await apiRequest(`challenges/${id}/solve/`, {
        method: 'POST',
        body: JSON.stringify({ code, language })
      });
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!challenge) {
    return <div>Loading challenge...</div>;
  }
  
  return (
    <div className="challenge-container">
      <h1>{challenge.title}</h1>
      <div className="difficulty-badge">{challenge.difficulty}</div>
      
      <div className="description">
        <h2>Problem Description</h2>
        <p>{challenge.description}</p>
      </div>
      
      <div className="example">
        <h3>Example</h3>
        <div>
          <strong>Input:</strong> 
          <pre>{challenge.example_input}</pre>
        </div>
        <div>
          <strong>Output:</strong> 
          <pre>{challenge.example_output}</pre>
        </div>
      </div>
      
      <div className="code-editor">
        <div className="language-selector">
          <label>Language:</label>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        
        <CodeMirror
          value={code}
          height="400px"
          extensions={[getLanguageExtension()]}
          onChange={(value) => setCode(value)}
        />
        
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'Submitting...' : 'Submit Solution'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {result && (
        <div className="results">
          <h3>Results</h3>
          
          <div className={`status ${result.all_tests_passed ? 'success' : 'failure'}`}>
            {result.all_tests_passed 
              ? '✅ All tests passed!' 
              : '❌ Some tests failed'}
          </div>
          
          <div className="test-cases">
            <h4>Test Cases</h4>
            {result.test_results.map((test, index) => (
              <div key={index} className={`test-case ${test.passed ? 'passed' : 'failed'}`}>
                <div className="test-header">
                  <span>Test Case {test.test_case}</span>
                  <span>{test.passed ? '✅ Passed' : '❌ Failed'}</span>
                </div>
                
                {/* Show detailed info for example test or if admin */}
                {(test.input && test.expected_output) && (
                  <div className="test-details">
                    <div>
                      <strong>Input:</strong> 
                      <pre>{test.input}</pre>
                    </div>
                    <div>
                      <strong>Expected Output:</strong> 
                      <pre>{test.expected_output}</pre>
                    </div>
                    <div>
                      <strong>Your Output:</strong> 
                      <pre>{test.actual_output}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeDetail;
```

This implementation provides a starting point for integrating the Online Compiler API with a React frontend. Similar patterns can be applied to Vue, Angular, or other frontend frameworks.
