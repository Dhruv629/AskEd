import React, { useState } from 'react';
import axios from 'axios';

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
      const res = await axios.get(`http://localhost:8080/extract?filename=${filename}`);
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
    <div className="p-4 border rounded shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">Extract Text</h2>
      <button
        onClick={handleExtract}
        className="px-4 py-1 bg-green-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Extracting..." : "Extract Text"}
      </button>
      <div className="mt-4 whitespace-pre-wrap">{extractedText}</div>
    </div>
  );
};

export default PdfTextExtractor;
