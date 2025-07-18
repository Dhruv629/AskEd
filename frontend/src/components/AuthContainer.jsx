import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthContainer = ({ onAuthenticated, darkMode = false, onToggleDarkMode }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (token, username) => {
    onAuthenticated(token, username);
  };

  const handleRegister = (token, username) => {
    onAuthenticated(token, username);
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-100 via-white to-blue-50'
    }`}>
      <header className="bg-blue-700 text-white py-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow">AskEd AI Assistant</h1>
            <p className="text-blue-200 mt-1 text-sm">Summarize, generate flashcards, and quizzes from your documents</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {isLogin ? (
          <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} darkMode={darkMode} />
        ) : (
          <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} darkMode={darkMode} />
        )}
      </main>

      <footer className={`py-4 text-center text-sm border-t mt-auto shadow-inner ${
        darkMode 
          ? 'bg-gray-800 text-gray-300 border-gray-700' 
          : 'bg-blue-50 text-blue-700'
      }`}>
        &copy; {new Date().getFullYear()} AskEd AI. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthContainer; 