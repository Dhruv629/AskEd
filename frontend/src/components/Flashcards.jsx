import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl } from '../utils/api';

// Add custom CSS for 3D flip effect
const flipCardStyles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`;

const Flashcards = ({ initialContent = '', initialFilename = null }) => {
  const [filename, setFilename] = useState(initialFilename || '');
  const [textContent, setTextContent] = useState(initialContent);
  const [generatedFlashcards, setGeneratedFlashcards] = useState({}); // { sessionId: { cards: [], timestamp: Date, sessionId: string } }
  const [savedFlashcards, setSavedFlashcards] = useState([]);
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFolderPrompt, setShowFolderPrompt] = useState(false);
  const [folderName, setFolderName] = useState('');
  // const [currentFolder, setCurrentFolder] = useState(null); // Removed unused variables
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [practiceCards, setPracticeCards] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedGeneratedSet, setSelectedGeneratedSet] = useState(null);

  // Auto-generate flashcards when initial content is provided
  useEffect(() => {
    if (initialContent) {
      // Clear any previous errors
      setError('');
      
      // If filename is provided, use PDF generation, otherwise use text generation
      if (initialFilename) {
        handleGenerateFromPDF(initialFilename);
      } else {
        handleGenerateFromText(initialContent);
      }
    }
  }, [initialContent, initialFilename]);

  // Get authentication token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  // Add authorization header to axios requests
  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken();
    console.log('Auth token:', token ? 'Present' : 'Missing');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, [getAuthToken]);

  const loadSavedFlashcards = useCallback(async () => {
    try {
      const response = await axios.get(getApiUrl('/db/flashcards'), {
        headers: getAuthHeaders()
      });
      setSavedFlashcards(response.data);
      
      // Extract unique folders
      const uniqueFolders = [...new Set(response.data.map(card => card.folder).filter(Boolean))];
      setFolders(uniqueFolders);
    } catch (err) {
      console.error('Failed to load saved flashcards:', err);
    }
  }, [getAuthHeaders]);

  // Load user's saved flashcards and folders on component mount
  useEffect(() => {
    loadSavedFlashcards();
  }, [loadSavedFlashcards]);

  // Inject custom CSS for flip card effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = flipCardStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleGenerateFromText = async (text) => {
    if (!text.trim()) {
      setError('No text provided for flashcard generation');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(getApiUrl('/ai/flashcards-from-text'), {
        inputText: text
      });
      
      const data = res.data;
      console.log('AI Response data:', data);
      console.log('AI Response type:', typeof data);
      
      let flashcards;
      try {
        if (Array.isArray(data)) {
          flashcards = data;
        } else if (typeof data === 'string') {
          // Try to parse the string as JSON
          flashcards = JSON.parse(data);
        } else {
          console.error('Unexpected data format:', data);
          throw new Error('Invalid response format from AI');
        }
        
        console.log('Parsed flashcards:', flashcards);
        console.log('Number of flashcards:', flashcards.length);
        
        // Validate that each flashcard has required fields
        flashcards.forEach((card, index) => {
          if (!card.question || !card.answer) {
            console.error(`Invalid flashcard at index ${index}:`, card);
            throw new Error(`Invalid flashcard format at index ${index}`);
          }
        });
        
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw AI response:', data);
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
      
      // Store with session ID and formatted timestamp
      const sessionId = `session_${Date.now()}`;
      const now = new Date();
      const formattedTimestamp = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      setGeneratedFlashcards(prev => ({
        ...prev,
        [sessionId]: {
          cards: flashcards,
          timestamp: now,
          formattedTimestamp: formattedTimestamp,
          sessionId: sessionId
        }
      }));
      
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
      const res = await axios.get(getApiUrl(`/ai/flashcards`), {
        params: { filename },
      });
      
      const data = res.data;
      console.log('AI Response data:', data);
      console.log('AI Response type:', typeof data);
      
      let flashcards;
      try {
        if (Array.isArray(data)) {
          flashcards = data;
        } else if (typeof data === 'string') {
          // Try to parse the string as JSON
          flashcards = JSON.parse(data);
        } else {
          console.error('Unexpected data format:', data);
          throw new Error('Invalid response format from AI');
        }
        
        console.log('Parsed flashcards:', flashcards);
        console.log('Number of flashcards:', flashcards.length);
        
        // Validate that each flashcard has required fields
        flashcards.forEach((card, index) => {
          if (!card.question || !card.answer) {
            console.error(`Invalid flashcard at index ${index}:`, card);
            throw new Error(`Invalid flashcard format at index ${index}`);
          }
        });
        
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw AI response:', data);
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
      
      // Store with session ID and formatted timestamp
      const sessionId = `session_${Date.now()}`;
      const now = new Date();
      const formattedTimestamp = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      setGeneratedFlashcards(prev => ({
        ...prev,
        [sessionId]: {
          cards: flashcards,
          timestamp: now,
          formattedTimestamp: formattedTimestamp,
          sessionId: sessionId
        }
      }));
      
    } catch (err) {
      console.error(err);
      setError('Failed to generate flashcards from PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlashcards = async (timestamp) => {
    const generatedSet = generatedFlashcards[timestamp];
    if (!generatedSet || generatedSet.cards.length === 0) {
      setError('No flashcards to save');
      return;
    }

    setError(''); // Clear any previous errors
    setSelectedGeneratedSet(timestamp);
    setShowFolderPrompt(true);
  };

  const handleConfirmSave = async () => {
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    if (!selectedGeneratedSet) {
      setError('No flashcards selected for saving');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const generatedSet = generatedFlashcards[selectedGeneratedSet];
      
      // Add folder information to flashcards
      const flashcardsWithFolder = generatedSet.cards.map(card => ({
        ...card,
        folder: folderName.trim()
      }));

      console.log('Saving flashcards:', flashcardsWithFolder);
      console.log('Auth headers:', getAuthHeaders());

      const response = await axios.post(getApiUrl('/db/flashcards'), flashcardsWithFolder, {
        headers: getAuthHeaders()
      });
      
      console.log('Save response:', response.data);
      
      // Reload saved flashcards
      await loadSavedFlashcards();
      
      // Remove the saved set from generated flashcards
      setGeneratedFlashcards(prev => {
        const newState = { ...prev };
        delete newState[selectedGeneratedSet];
        return newState;
      });
      
      // Reset state
      setSelectedGeneratedSet(null);
      setFolderName('');
      setShowFolderPrompt(false);
      
      alert('Flashcards saved successfully!');
    } catch (err) {
      console.error('Failed to save flashcards:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Show more specific error message
      let errorMessage = 'Failed to save flashcards. Please try again.';
      if (err.response?.data) {
        // Handle different types of error responses
        if (typeof err.response.data === 'object') {
          errorMessage = `Failed to save flashcards: ${JSON.stringify(err.response.data)}`;
        } else {
          errorMessage = `Failed to save flashcards: ${err.response.data}`;
        }
      } else if (err.message) {
        errorMessage = `Failed to save flashcards: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFlashcard = async (id) => {
    try {
      await axios.delete(getApiUrl(`/db/flashcards/${id}`), {
        headers: getAuthHeaders()
      });
      
      // Reload saved flashcards
      await loadSavedFlashcards();
    } catch (err) {
      console.error('Failed to delete flashcard:', err);
      setError('Failed to delete flashcard');
    }
  };

  const handleDeleteFolder = async (folder) => {
    const cardsInFolder = getFlashcardsByFolder(folder);
    if (cardsInFolder.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the folder "${folder}" and all ${cardsInFolder.length} flashcards in it? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // Delete all flashcards in the folder
      const deletePromises = cardsInFolder.map(card => 
        axios.delete(getApiUrl(`/db/flashcards/${card.id}`), {
          headers: getAuthHeaders()
        })
      );
      
      await Promise.all(deletePromises);
      
      // Reload saved flashcards
      await loadSavedFlashcards();
      
      // Remove from expanded folders if it was expanded
      const newExpandedFolders = new Set(expandedFolders);
      newExpandedFolders.delete(folder);
      setExpandedFolders(newExpandedFolders);
      
    } catch (err) {
      console.error('Failed to delete folder:', err);
      setError('Failed to delete folder. Please try again.');
    }
  };

  const handleDeleteGeneratedSet = (timestamp) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this generated flashcard set? This action cannot be undone.'
    );

    if (!confirmed) return;

    setGeneratedFlashcards(prev => {
      const newState = { ...prev };
      delete newState[timestamp];
      return newState;
    });
  };

  // Handle logout cleanup
  const handleLogout = useCallback(() => {
    setGeneratedFlashcards({});
    setSelectedGeneratedSet(null);
  }, []);

  // Cleanup generated flashcards on logout
  useEffect(() => {
    // Listen for logout events (you can trigger this from your auth component)
    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('logout', handleLogout);
    };
  }, [handleLogout]);

  // Utility function to trigger logout cleanup (call this from your auth component)
  // const triggerLogoutCleanup = () => { // Removed unused function
  //   window.dispatchEvent(new Event('logout'));
  // };

  // NOTE: To trigger logout cleanup from your auth component, call:
  // window.dispatchEvent(new Event('logout'));

  const getFlashcardsByFolder = useCallback((folder) => {
    return savedFlashcards.filter(card => card.folder === folder);
  }, [savedFlashcards]);

  // Practice Mode Functions
  const startPracticeMode = useCallback((folder = null) => {
    let cardsToPractice;
    if (folder) {
      cardsToPractice = getFlashcardsByFolder(folder);
    } else {
      cardsToPractice = savedFlashcards;
    }
    
    if (cardsToPractice.length === 0) {
      setError('No flashcards to practice!');
      return;
    }
    
    setPracticeCards(cardsToPractice);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setPracticeMode(true);
  }, [getFlashcardsByFolder, savedFlashcards]);

  const stopPracticeMode = useCallback(() => {
    setPracticeMode(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setPracticeCards([]);
  }, []);

  const nextCard = useCallback(() => {
    if (currentCardIndex < practiceCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex, practiceCards.length]);

  const previousCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const toggleFolder = (folder) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(folder)) {
      newExpandedFolders.delete(folder);
    } else {
      newExpandedFolders.add(folder);
    }
    setExpandedFolders(newExpandedFolders);
  };

  // Keyboard shortcuts for practice mode
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!practiceMode) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousCard();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextCard();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          flipCard();
          break;
        case 'Escape':
          e.preventDefault();
          stopPracticeMode();
          break;
        default:
          break;
      }
    };

    if (practiceMode) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [practiceMode, currentCardIndex, isFlipped, flipCard, nextCard, previousCard, stopPracticeMode]);

  return (
    <div className="space-y-6">
      {/* Practice Mode Section */}
      {practiceMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl mx-4 w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-blue-700">Practice Mode</h2>
              <button
                onClick={stopPracticeMode}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Instructions */}
            <div className="text-center mb-4 text-sm text-gray-600">
              <p>Click the card or press Space/Enter to flip • Use arrow keys to navigate • Press Escape to exit</p>
            </div>

            {/* Progress */}
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Card {currentCardIndex + 1} of {practiceCards.length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCardIndex + 1) / practiceCards.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Flip Card */}
            <div className="mb-8">
              <div 
                className="relative w-full h-64 cursor-pointer perspective-1000"
                onClick={flipCard}
              >
                <div 
                  className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front of card (Question) */}
                  <div className="absolute inset-0 w-full h-full backface-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl flex items-center justify-center p-6 text-white">
                      <div className="text-center">
                        <div className="text-sm font-semibold mb-2 opacity-80">QUESTION</div>
                        <div className="text-xl font-bold leading-relaxed">
                          {practiceCards[currentCardIndex]?.question}
                        </div>
                        <div className="text-sm mt-4 opacity-70">Click to see answer</div>
                      </div>
                    </div>
                  </div>

                  {/* Back of card (Answer) */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl flex items-center justify-center p-6 text-white">
                      <div className="text-center">
                        <div className="text-sm font-semibold mb-2 opacity-80">ANSWER</div>
                        <div className="text-xl font-bold leading-relaxed">
                          {practiceCards[currentCardIndex]?.answer}
                        </div>
                        <div className="text-sm mt-4 opacity-70">Click to see question</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                ← Previous
              </button>

              <div className="text-center">
                <button
                  onClick={flipCard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg"
                >
                  {isFlipped ? 'Show Question' : 'Show Answer'}
                </button>
              </div>

              <button
                onClick={nextCard}
                disabled={currentCardIndex === practiceCards.length - 1}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Flashcards Section */}
      <div className="p-6 bg-white/90 border rounded-2xl shadow-xl">
        <h2 className="text-2xl font-extrabold mb-6 text-blue-700 tracking-tight">Generate Flashcards</h2>
        
        <div className="mb-6">
          <label htmlFor="pdfFilename" className="block font-semibold mb-1 text-blue-900">PDF Filename (Optional)</label>
          <input
            id="pdfFilename"
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
          <label htmlFor="textInput" className="block font-semibold mb-1 text-blue-900">Text Content</label>
          <textarea
            id="textInput"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your text here to generate flashcards..."
            className="w-full p-3 border-2 border-blue-200 rounded-lg bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">Paste text content to generate flashcards</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (filename) {
                handleGenerateFromPDF(filename);
              } else if (textContent.trim()) {
                handleGenerateFromText(textContent);
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
        
        {Object.keys(generatedFlashcards).length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold mb-4 text-blue-700 text-lg">Generated Flashcards</h3>
            <div className="space-y-4">
              {Object.entries(generatedFlashcards)
                .sort(([a], [b]) => b - a) // Sort by timestamp, newest first
                .map(([timestamp, set]) => (
                  <div key={timestamp} className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-semibold text-blue-800">
                          Generated on {set.formattedTimestamp}
                        </h4>
                        <p className="text-sm text-gray-600">{set.cards.length} flashcards</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveFlashcards(timestamp)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                          💾 Save
                        </button>
                        <button
                          onClick={() => handleDeleteGeneratedSet(timestamp)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200"
                          title="Delete this set"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      {set.cards.map((card, index) => (
                        <div key={index} className="border-2 border-blue-200 p-4 rounded-xl bg-white shadow-inner">
                          <p className="font-semibold text-blue-800 mb-2">Q: {card.question}</p>
                          <p className="text-green-800">A: {card.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>



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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight">My Saved Flashcards</h2>
          {savedFlashcards.length > 0 && (
            <button
              onClick={() => startPracticeMode()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              🎯 Practice All Cards
            </button>
          )}
        </div>
        
        {savedFlashcards.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No saved flashcards yet. Generate and save some flashcards to see them here!</p>
        ) : (
          <div className="space-y-6">
            {folders.map((folder) => {
              const cardCount = getFlashcardsByFolder(folder).length;
              const isExpanded = expandedFolders.has(folder);
              
              return (
                <div key={folder} className="border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => toggleFolder(folder)}
                      className="flex items-center gap-3 text-left hover:bg-blue-50 p-2 rounded-lg transition-all duration-200 flex-1"
                    >
                      <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-700">{folder}</h3>
                        <p className="text-sm text-gray-600">{cardCount} card{cardCount !== 1 ? 's' : ''}</p>
                      </div>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startPracticeMode(folder)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                      >
                        🎯 Practice
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1"
                        title="Delete folder and all cards"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
