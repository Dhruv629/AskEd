import React, { useState } from 'react';
import Summarizer from './components/Summarizer';
import Flashcards from './components/Flashcards';

const App = () => {
  const [activeTab, setActiveTab] = useState('summarizer');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white font-sans flex flex-col">
      <header className="bg-blue-600 text-white py-6 shadow">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight">AskEd AI Assistant</h1>
          <p className="text-blue-100 mt-1">Summarize, generate flashcards, and quizzes from your documents</p>
        </div>
      </header>
      <nav className="max-w-3xl mx-auto w-full px-4 mt-6">
        <div className="flex gap-4 justify-center">
          <button
            className={`px-5 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm border-2 ${
              activeTab === 'summarizer'
                ? 'bg-blue-500 text-white border-blue-600 scale-105'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('summarizer')}
          >
            Summarizer
          </button>
          <button
            className={`px-5 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm border-2 ${
              activeTab === 'flashcards'
                ? 'bg-blue-500 text-white border-blue-600 scale-105'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab('flashcards')}
          >
            Flashcards
          </button>
        </div>
      </nav>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 mt-8">
        {activeTab === 'summarizer' && <Summarizer />}
        {activeTab === 'flashcards' && <Flashcards />}
      </main>
      <footer className="bg-blue-50 text-blue-700 py-4 mt-12 text-center text-sm border-t">
        &copy; {new Date().getFullYear()} AskEd AI. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
