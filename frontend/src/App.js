import React, { useState, useEffect } from 'react';
import Summarizer from './components/Summarizer';
import Flashcards from './components/Flashcards';
import Home from './components/Home';
import AuthContainer from './components/AuthContainer';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sharedContent, setSharedContent] = useState('');
  const [sharedFilename, setSharedFilename] = useState('');

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      setIsAuthenticated(true);
      setUser({ token, username });
    }
  }, []);

  const handleAuthenticated = (token, username) => {
    setIsAuthenticated(true);
    setUser({ token, username });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('home');
    setSharedContent('');
    setSharedFilename('');
  };

  const handleNavigateToSummarizer = (content) => {
    setSharedContent(content);
    setActiveTab('summarizer');
  };

  const handleNavigateToFlashcards = (content, filename = null) => {
    setSharedContent(content);
    setSharedFilename(filename);
    setActiveTab('flashcards');
  };

  const handleBackToHome = () => {
    setActiveTab('home');
    setSharedContent('');
    setSharedFilename('');
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AuthContainer onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 font-sans flex flex-col">
      <header className="bg-blue-700 text-white py-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow">AskEd AI Assistant</h1>
            <p className="text-blue-200 mt-1 text-sm">Summarize, generate flashcards, and quizzes from your documents</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm">
              Welcome, {user?.username}!
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <nav className="max-w-3xl mx-auto w-full px-4 mt-6">
        <div className="flex gap-4 justify-center">
          <button
            className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white border-blue-700 scale-105 shadow-md'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
              activeTab === 'summarizer'
                ? 'bg-blue-600 text-white border-blue-700 scale-105 shadow-md'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('summarizer')}
          >
            Summarizer
          </button>
          <button
            className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
              activeTab === 'flashcards'
                ? 'bg-blue-600 text-white border-blue-700 scale-105 shadow-md'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('flashcards')}
          >
            Flashcards
          </button>
        </div>
      </nav>
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 mt-8 mb-8">
        {activeTab === 'home' && (
          <Home 
            onNavigateToSummarizer={handleNavigateToSummarizer}
            onNavigateToFlashcards={handleNavigateToFlashcards}
          />
        )}
        {activeTab === 'summarizer' && (
          <div>
            <button
              onClick={handleBackToHome}
              className="mb-4 text-blue-600 hover:underline text-sm font-semibold focus:outline-none"
            >
              &larr; Back to Home
            </button>
            <Summarizer initialText={sharedContent} />
          </div>
        )}
        {activeTab === 'flashcards' && (
          <div>
            <button
              onClick={handleBackToHome}
              className="mb-4 text-blue-600 hover:underline text-sm font-semibold focus:outline-none"
            >
              &larr; Back to Home
            </button>
            <Flashcards initialContent={sharedContent} initialFilename={sharedFilename} />
          </div>
        )}
      </main>
      
      <footer className="bg-blue-50 text-blue-700 py-4 text-center text-sm border-t mt-auto shadow-inner">
        &copy; {new Date().getFullYear()} AskEd AI. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
