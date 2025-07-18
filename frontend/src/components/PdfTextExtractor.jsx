import React, { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../utils/api';

const PdfTextExtractor = ({ filename, onExtracted }) => {
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    if (!filename) {
      alert("No file uploaded yet.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(getApiUrl(`/extract?filename=${filename}`));
      setExtractedText(res.data);
      if (onExtracted) onExtracted(res.data);
    } catch (err) {
      console.error("Failed to extract:", err);
      setExtractedText("Failed to extract text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-blue-200 rounded-xl shadow bg-white/90 mb-4">
      <h2 className="text-lg font-bold mb-2 text-blue-700">Extract Text</h2>
      <button
        onClick={handleExtract}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Extracting..." : "Extract Text"}
      </button>
      <div className="mt-4 whitespace-pre-wrap text-blue-900 text-sm">{extractedText}</div>
    </div>
  );
};

export default PdfTextExtractor;
