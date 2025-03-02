import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './components/AuthContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email for further instructions');
    } catch (error) {
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-900 via-purple-900 to-fuchsia-900 text-gray-200 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-indigo-800/30 backdrop-blur-sm rounded-xl border border-purple-500/30 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
            Reset Password
          </h1>
          <p className="mt-2 text-gray-300">We'll send you reset instructions</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-900/60 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="p-3 bg-green-900/60 border border-green-500/50 rounded-lg text-green-200 text-sm">
            {message}
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
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-md font-bold transition-all 
            border-2 border-blue-400 shadow-lg shadow-blue-500/50
            bg-gradient-to-r from-blue-600 to-purple-500
            hover:shadow-blue-500/80 hover:animate-pulse transform hover:scale-105"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
          
          <div className="flex justify-between text-sm mt-4">
            <Link to="/login" className="font-medium text-pink-300 hover:text-pink-200">
              Back to Login
            </Link>
            
            <Link to="/signup" className="font-medium text-pink-300 hover:text-pink-200">
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;