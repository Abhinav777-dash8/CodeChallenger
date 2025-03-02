import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-900 via-purple-900 to-fuchsia-900 text-gray-200 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-indigo-800/30 backdrop-blur-sm rounded-xl border border-purple-500/30 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
            Create Account
          </h1>
          <p className="mt-2 text-gray-300">Join Coder's Stop today</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-900/60 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-indigo-900/50 border border-purple-500/50 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-indigo-900/50 border border-purple-500/50 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
              placeholder="Create a password"
            />
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-indigo-900/50 border border-purple-500/50 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
              placeholder="Confirm your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-md font-bold transition-all 
            border-2 border-purple-400 shadow-lg shadow-purple-500/50
            bg-gradient-to-r from-purple-600 to-fuchsia-500
            hover:shadow-purple-500/80 hover:animate-pulse transform hover:scale-105"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
          
          <div className="text-center text-sm">
            <span className="text-gray-300">Already have an account? </span>
            <Link to="/login" className="font-medium text-pink-300 hover:text-pink-200">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;