// Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(username, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-fuchsia-900">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
        <div className="absolute top-40 left-20 w-64 h-64 rounded-full bg-purple-300 filter blur-3xl"></div>
        <div className="absolute top-60 right-20 w-72 h-72 rounded-full bg-blue-300 filter blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-fuchsia-300 filter blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="p-8 rounded-xl shadow-2xl bg-indigo-800/30 backdrop-blur-sm border border-purple-500/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 flex items-center justify-center">
              <svg className="w-8 h-8 mr-3 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Coder's Stop
            </h1>
            <p className="text-gray-300 mt-2">Sign in to continue your coding journey</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-md bg-indigo-900/50 border border-purple-500/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-md bg-indigo-900/50 border border-purple-500/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded bg-indigo-900 border-purple-500 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="text-purple-300 hover:text-pink-300 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-md font-medium transition-all 
                bg-gradient-to-r from-purple-600 to-fuchsia-500
                hover:from-purple-500 hover:to-fuchsia-400
                border-2 border-purple-400 shadow-lg shadow-purple-500/30
                hover:shadow-purple-500/50 transform hover:scale-[1.02]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-300">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-300 hover:text-pink-300 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;