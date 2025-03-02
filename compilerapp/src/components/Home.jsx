import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiRequest } from '../utils/api';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';

const Home = () => {
  const [code, setCode] = useState('// Write your code here\n\nfunction solution(input) {\n  // Your solution\n  return input;\n}\n');
  const [status, setStatus] = useState('Ready to run');
  const [darkMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch challenges and leaderboard on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challengesRes, leaderboardRes] = await Promise.all([
          apiRequest('challenges/'),
          apiRequest('leaderboard/')
        ]);
        setProblems(challengesRes);
        setLeaderboard(leaderboardRes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Click outside dropdown handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLanguageExtension = () => {
    switch(selectedLanguage) {
      case 'python': return python();
      case 'java': return java();
      case 'cpp': return cpp();
      default: return javascript({ jsx: true });
    }
  };

  const handleSubmit = async () => {
    setStatus('Submitting...');
    try {
      const result = await apiRequest('compile/', 'POST', {
        code,
        language: selectedLanguage,
        stdin: ''
      });
      
      setStatus(result.result.stderr 
        ? `❌ Error: ${result.result.stderr}`
        : `✅ Output: ${result.result.stdout}`);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  const handleRun = async () => {
    setStatus('Running...');
    try {
      const result = await apiRequest('compile/', 'POST', {
        code,
        language: selectedLanguage,
        stdin: ''
      });
      
      setStatus(result.result.stderr 
        ? `❌ Error: ${result.result.stderr}`
        : `✅ Output: ${result.result.stdout}`);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const selectLanguage = (lang) => {
    setSelectedLanguage(lang);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const GlowingButton = ({ children, onClick, color }) => {
    const colorConfig = {
      primary: {
        base: 'border-purple-400 shadow-purple-500/50',
        hover: 'hover:shadow-purple-500/80',
        bg: 'bg-gradient-to-r from-purple-600 to-fuchsia-500'
      },
      secondary: {
        base: 'border-pink-400 shadow-pink-500/50',
        hover: 'hover:shadow-pink-500/80',
        bg: 'bg-gradient-to-r from-fuchsia-500 to-pink-500'
      }
    };

    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md font-bold transition-all flex items-center space-x-2 
          border-2 ${colorConfig[color].base}
          ${colorConfig[color].bg}
          shadow-lg ${colorConfig[color].hover}
          hover:animate-pulse transform hover:scale-105`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-900 via-purple-900 to-fuchsia-900 text-gray-200">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
        <div className="absolute top-40 left-20 w-64 h-64 rounded-full bg-purple-300 filter blur-3xl"></div>
        <div className="absolute top-60 right-20 w-72 h-72 rounded-full bg-blue-300 filter blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-fuchsia-300 filter blur-3xl"></div>
      </div>
      
      <header className="relative z-10 bg-gradient-to-r from-indigo-800/70 to-purple-800/70 backdrop-blur-md p-4 shadow-xl border-b border-purple-500/30">
        <div className="w-full mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 flex items-center">
              <svg className="w-6 h-6 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Coder's Stop
            </h1>
            <nav className="ml-10 flex space-x-6">
              <button className="text-purple-200 hover:text-pink-300 transition-colors font-medium">Explore</button>
              <button className="text-purple-200 hover:text-pink-300 transition-colors font-medium">Problems</button>
              <button className="text-purple-200 hover:text-pink-300 transition-colors font-medium">Solutions</button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-purple-200">Welcome, {user.username}</span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-1 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium text-sm hover:from-red-500 hover:to-pink-500 transition-all"
                >
                  Sign Out
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/30">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 p-4 relative z-10">
        {/* Problems List Section */}
        <div className="space-y-4 h-[calc(100vh-180px)] overflow-y-auto pr-2">
          <div className="p-4 sticky top-0 bg-indigo-900/80 backdrop-blur-md z-10 rounded-t-xl border-b border-purple-500/30">
            <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Problems List</h2>
            <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
              <span>Problem Title</span>
              <span>Difficulty</span>
            </div>
          </div>
          
          {problems.map((problem) => (
            <div 
              key={problem.id}
              className="p-4 rounded-lg cursor-pointer transition-all bg-indigo-800/40 backdrop-blur-sm hover:bg-indigo-700/50 border border-purple-500/30 hover:border-pink-500/50"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{problem.title}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  problem.difficulty === 'easy' ? 'bg-green-900/60 text-green-300' :
                  problem.difficulty === 'medium' ? 'bg-yellow-900/60 text-yellow-300' :
                  'bg-red-900/60 text-red-300'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
              <p className="text-sm mt-2 text-gray-300 line-clamp-2">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Editor Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex-1 rounded-xl shadow-lg overflow-hidden bg-indigo-800/30 backdrop-blur-sm border border-purple-500/30">
            <div className="px-6 py-3 flex justify-between items-center bg-indigo-900/60 backdrop-blur-md border-b border-purple-500/30">
              <div className="flex items-center space-x-4">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 px-3 py-1 rounded-md bg-indigo-800 hover:bg-indigo-700 transition-colors"
                  >
                    <span>{selectedLanguage}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-36 rounded-md shadow-lg bg-indigo-800 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => selectLanguage(lang)}
                            className="block px-4 py-2 w-full text-left text-sm hover:bg-indigo-700 transition-colors"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleRun}
                  className="px-3 py-1 rounded-md bg-indigo-700 hover:bg-indigo-600 transition-colors text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-3 py-1 rounded-md bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-colors text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Submit
                </button>
              </div>
            </div>
            
            <div className="p-4 h-[calc(100vh-320px)]">
              <CodeMirror
                value={code}
                height="100%"
                extensions={[getLanguageExtension()]}
                onChange={(value) => setCode(value)}
                theme={darkMode ? 'dark' : 'light'}
              />
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-indigo-800/30 backdrop-blur-sm border border-purple-500/30">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Status</h3>
              <div className="text-xs text-gray-400">Press Ctrl+Enter to submit</div>
            </div>
            <div className="bg-indigo-900/60 rounded-md p-3 font-mono text-sm">
              {status}
            </div>
          </div>
        </div>

        {/* Leaderboard and Hints Section */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-800/30 backdrop-blur-sm border border-purple-500/30">
            <h3 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Top Coders</h3>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div 
                  key={user.id}
                  className="flex items-center p-2 rounded-lg bg-indigo-900/40 hover:bg-indigo-800/60 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    index === 2 ? 'bg-amber-700 text-amber-100' :
                    'bg-purple-700 text-purple-100'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-gray-400">{user.challenges_completed} problems solved</div>
                  </div>
                  <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                    {user.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-indigo-800/30 backdrop-blur-sm border border-purple-500/30">
            <h3 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Hints</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-indigo-900/40 text-sm">
                <div className="font-medium mb-1">Hint 1</div>
                <p className="text-gray-300">Consider using a hash map to store the values you've seen so far.</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-900/40 text-sm">
                <div className="font-medium mb-1">Hint 2</div>
                <p className="text-gray-300">Think about the time complexity of your solution. Can you solve it in O(n)?</p>
              </div>
              <div className="flex justify-center mt-4">
                <GlowingButton onClick={() => {}} color="secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Get Premium Hints</span>
                </GlowingButton>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-indigo-800/30 backdrop-blur-sm border border-purple-500/30">
            <h3 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Similar Problems</h3>
            <div className="space-y-2">
              {problems.slice(0, 3).map((problem) => (
                <div 
                  key={problem.id}
                  className="p-2 rounded-lg cursor-pointer transition-all bg-indigo-900/40 hover:bg-indigo-800/60"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{problem.title}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      problem.difficulty === 'easy' ? 'bg-green-900/60 text-green-300' :
                      problem.difficulty === 'medium' ? 'bg-yellow-900/60 text-yellow-300' :
                      'bg-red-900/60 text-red-300'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;