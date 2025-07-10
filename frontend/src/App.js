import React, { useState } from 'react';
import Summarizer from './components/Summarizer';
import Flashcards from './components/Flashcards';

const App = () => {
  const [activeTab, setActiveTab] = useState('summarizer');

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
      <nav className="max-w-3xl mx-auto w-full px-4 mt-6">
        <div className="flex gap-4 justify-center">
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
        {activeTab === 'summarizer' && <Summarizer />}
        {activeTab === 'flashcards' && <Flashcards />}
      </main>
      <footer className="bg-blue-50 text-blue-700 py-4 text-center text-sm border-t mt-auto shadow-inner">
        &copy; {new Date().getFullYear()} AskEd AI. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
