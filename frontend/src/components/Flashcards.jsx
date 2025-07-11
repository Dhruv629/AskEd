import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Flashcards = ({ initialContent = '', initialFilename = null }) => {
  const [filename, setFilename] = useState(initialFilename || '');
  const [flashcards, setFlashcards] = useState([]);
  const [savedFlashcards, setSavedFlashcards] = useState([]);
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGeneratePrompt, setShowGeneratePrompt] = useState(false);
  const [showFolderPrompt, setShowFolderPrompt] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);

  // Auto-generate flashcards when initial content is provided
  useEffect(() => {
    if (initialContent && !flashcards.length) {
      handleGenerateFromText(initialContent);
    }
  }, [initialContent]);

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Add authorization header to axios requests
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Load user's saved flashcards and folders on component mount
  useEffect(() => {
    loadSavedFlashcards();
  }, []);

  const loadSavedFlashcards = async () => {
    try {
      const response = await axios.get('http://localhost:8080/db/flashcards', {
        headers: getAuthHeaders()
      });
      setSavedFlashcards(response.data);
      
      // Extract unique folders
      const uniqueFolders = [...new Set(response.data.map(card => card.folder).filter(Boolean))];
      setFolders(uniqueFolders);
    } catch (err) {
      console.error('Failed to load saved flashcards:', err);
    }
  };

  const handleGenerateFromText = async (text) => {
    if (!text.trim()) {
      setError('No text provided for flashcard generation');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8080/ai/flashcards-from-text', {
        text: text
      });
      
      const data = res.data;
      if (Array.isArray(data)) {
        setFlashcards(data);
      } else {
        setFlashcards(JSON.parse(data));
      }
      
      setShowGeneratePrompt(true);
    } catch (err) {
      console.error(err);
      setError('Failed to generate flashcards from text');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromPDF = async (filename) => {
    if (!filename.trim()) {
      setError('No filename provided');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:8080/ai/flashcards`, {
        params: { filename },
      });
      
      const data = res.data;
      if (Array.isArray(data)) {
        setFlashcards(data);
      } else {
        setFlashcards(JSON.parse(data));
      }
      
      setShowGeneratePrompt(true);
    } catch (err) {
      console.error(err);
      setError('Failed to generate flashcards from PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlashcards = async () => {
    if (flashcards.length === 0) {
      setError('No flashcards to save');
      return;
    }

    setShowFolderPrompt(true);
  };

  const handleConfirmSave = async () => {
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    setSaving(true);
    setError('');
    try {
      // Add folder information to flashcards
      const flashcardsWithFolder = flashcards.map(card => ({
        ...card,
        folder: folderName.trim()
      }));

      const response = await axios.post('http://localhost:8080/db/flashcards', flashcardsWithFolder, {
        headers: getAuthHeaders()
      });
      
      // Reload saved flashcards
      await loadSavedFlashcards();
      
      // Clear generated flashcards and reset state
      setFlashcards([]);
      setFolderName('');
      setShowFolderPrompt(false);
      setShowGeneratePrompt(false);
      
      alert('Flashcards saved successfully!');
    } catch (err) {
      console.error('Failed to save flashcards:', err);
      setError('Failed to save flashcards. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFlashcard = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/db/flashcards/${id}`, {
        headers: getAuthHeaders()
      });
      
      // Reload saved flashcards
      await loadSavedFlashcards();
    } catch (err) {
      console.error('Failed to delete flashcard:', err);
      setError('Failed to delete flashcard');
    }
  };

  const getFlashcardsByFolder = (folder) => {
    return savedFlashcards.filter(card => card.folder === folder);
  };

  return (
    <div className="space-y-6">
      {/* Generate Flashcards Section */}
      <div className="p-6 bg-white/90 border rounded-2xl shadow-xl">
        <h2 className="text-2xl font-extrabold mb-6 text-blue-700 tracking-tight">Generate Flashcards</h2>
        
        <div className="mb-6">
          <label className="block font-semibold mb-1 text-blue-900">PDF Filename (Optional)</label>
          <input
            type="text"
            placeholder="Enter filename (e.g. file.pdf) or leave empty for text input"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full p-3 border-2 border-blue-200 rounded-lg bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          <p className="text-xs text-gray-500 mt-1">
            {filename ? 'Will generate flashcards from PDF content' : 'Enter text below to generate flashcards from text'}
          </p>
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-1 text-blue-900">Text Content</label>
          <textarea
            placeholder="Paste your text here to generate flashcards..."
            className="w-full p-3 border-2 border-blue-200 rounded-lg bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            rows={4}
            id="textInput"
          />
          <p className="text-xs text-gray-500 mt-1">Paste text content to generate flashcards</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => {
              const text = document.getElementById('textInput').value;
              if (filename) {
                handleGenerateFromPDF(filename);
              } else if (text.trim()) {
                handleGenerateFromText(text);
              } else {
                setError('Please provide either a PDF filename or text content');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white px-6 py-2 rounded-lg font-semibold shadow flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
            {loading ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>

        {error && <p className="text-red-600 mt-2 font-semibold">{error}</p>}
        
        {flashcards.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold mb-4 text-blue-700 text-lg">Generated Flashcards ({flashcards.length}):</h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {flashcards.map((card, index) => (
                <div key={index} className="border-2 border-blue-200 p-4 rounded-xl bg-blue-50 shadow-inner">
                  <p className="font-semibold text-blue-800 mb-2">Q: {card.question}</p>
                  <p className="text-green-800">A: {card.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate Prompt Modal */}
      {showGeneratePrompt && flashcards.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Flashcards Generated!</h3>
            <p className="mb-4 text-gray-600">
              {flashcards.length} flashcards have been generated. Would you like to save them?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowGeneratePrompt(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFlashcards}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Save Flashcards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Name Prompt Modal */}
      {showFolderPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Save Flashcards</h3>
            <p className="mb-4 text-gray-600">
              Enter a folder name to organize your flashcards:
            </p>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Biology Chapter 1, Math Formulas, etc."
              className="w-full p-3 border-2 border-blue-200 rounded-lg bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowFolderPrompt(false);
                  setFolderName('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                disabled={saving}
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Flashcards Section */}
      <div className="p-6 bg-white/90 border rounded-2xl shadow-xl">
        <h2 className="text-2xl font-extrabold mb-6 text-blue-700 tracking-tight">My Saved Flashcards</h2>
        
        {savedFlashcards.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No saved flashcards yet. Generate and save some flashcards to see them here!</p>
        ) : (
          <div className="space-y-6">
            {folders.map((folder) => (
              <div key={folder} className="border-2 border-blue-200 rounded-xl p-4">
                <h3 className="text-lg font-bold text-blue-700 mb-4">{folder}</h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {getFlashcardsByFolder(folder).map((card) => (
                    <div key={card.id} className="border-2 border-blue-200 p-4 rounded-xl bg-blue-50 shadow-inner relative">
                      <button
                        onClick={() => handleDeleteFlashcard(card.id)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold text-lg"
                        title="Delete flashcard"
                      >
                        ×
                      </button>
                      <p className="font-semibold text-blue-800 mb-2">Q: {card.question}</p>
                      <p className="text-green-800">A: {card.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
