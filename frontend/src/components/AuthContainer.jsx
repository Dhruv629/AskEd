import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthContainer = ({ onAuthenticated }) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 font-sans flex flex-col">
      <header className="bg-blue-700 text-white py-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow">AskEd AI Assistant</h1>
            <p className="text-blue-200 mt-1 text-sm">Summarize, generate flashcards, and quizzes from your documents</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {isLogin ? (
          <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        ) : (
          <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
        )}
      </main>

      <footer className="bg-blue-50 text-blue-700 py-4 text-center text-sm border-t mt-auto shadow-inner">
        &copy; {new Date().getFullYear()} AskEd AI. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthContainer; 