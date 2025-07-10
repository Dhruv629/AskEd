import React, { useState } from 'react';
import axios from 'axios';

const Flashcards = () => {
  const [filename, setFilename] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchFlashcards = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/ai/flashcards`, {
        params: { filename },
      });
      const data = res.data;

      if (Array.isArray(data)) {
        setFlashcards(data);
      } else {
        setFlashcards(JSON.parse(data)); // fallback if returned as string
      }

      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch flashcards');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white/80 border rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Generate Flashcards</h2>
      <div className="mb-6">
        <label className="block font-medium mb-1">PDF Filename</label>
        <input
          type="text"
          placeholder="Enter filename (e.g. file.pdf)"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="w-full p-3 border rounded bg-blue-50 focus:bg-white focus:outline-blue-300 transition"
        />
        <p className="text-xs text-gray-500 mt-1">Use the filename of a PDF you've uploaded. Flashcards will be generated from its content.</p>
      </div>
      <button
        onClick={handleFetchFlashcards}
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-lg font-semibold shadow mb-4 flex items-center gap-2"
        disabled={loading || !filename}
      >
        {loading && (
          <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        )}
        {loading ? 'Loading...' : 'Fetch Flashcards'}
      </button>
      {error && <p className="text-red-600 mt-2 font-semibold">{error}</p>}
      {flashcards.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4 text-blue-700 text-lg">Flashcards:</h3>
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
  );
};

export default Flashcards;
