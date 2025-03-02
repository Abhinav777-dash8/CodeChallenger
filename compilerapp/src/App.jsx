import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import ProtectedRoute from './components/ProtectedRoute'; // Adjust path as needed
import "./App.css";
// Add this import at the top of App.jsx
import Signup from './Signup'; // Adjust path according to your project structure

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
