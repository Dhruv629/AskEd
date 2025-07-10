import React, { useState } from 'react';
import axios from 'axios';
import PdfUploader from './PdfUploader';
import PdfTextExtractor from './PdfTextExtractor';

const Summarizer = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [extractedText, setExtractedText] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const textToSummarize = extractedText || inputText;
      if (!textToSummarize) {
        setSummary('Please provide text or upload and extract from a PDF.');
        setLoading(false);
        return;
      }
      const inputTextForApi = customPrompt
        ? `${customPrompt}\n\n${textToSummarize}`
        : textToSummarize;
      const res = await axios.post('http://localhost:8080/ai/summarize', {
        inputText: inputTextForApi,
      });
      setSummary(res.data);
    } catch (error) {
      console.error('Error summarizing:', error);
      setSummary('Failed to summarize.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (filename) => {
    setUploadedFilename(filename);
    setExtractedText(''); // reset extracted text on new upload
  };

  const handleExtracted = (text) => {
    setExtractedText(text);
  };

  return (
    <div className="p-6 bg-white/80 border rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Summarize Text or PDF</h2>
      <div className="mb-6">
        <label className="block font-medium mb-1">Paste Text</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type your text here..."
          className="w-full p-3 border rounded bg-blue-50 focus:bg-white focus:outline-blue-300 transition"
          rows={5}
        />
        <p className="text-xs text-gray-500 mt-1">Or upload a PDF below to extract and summarize its content.</p>
      </div>
      <div className="mb-6">
        <PdfUploader onUploadSuccess={handleUploadSuccess} />
        {uploadedFilename && !extractedText && (
          <PdfTextExtractor filename={uploadedFilename} onExtracted={handleExtracted} />
        )}
        {uploadedFilename && extractedText && (
          <div className="mt-2 text-xs text-green-700">PDF extracted and ready for summarization.</div>
        )}
      </div>
      <div className="mb-6">
        <label className="block font-medium mb-1">Custom Prompt <span className="text-gray-400">(optional)</span></label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="e.g. Summarize in bullet points"
          className="w-full p-2 border rounded bg-blue-50 focus:bg-white focus:outline-blue-300 transition"
        />
        <p className="text-xs text-gray-500 mt-1">You can guide the summary style, e.g., "Summarize in 5 bullet points".</p>
      </div>
      <button
        onClick={handleSummarize}
        className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded-lg font-semibold shadow mb-4 flex items-center gap-2"
        disabled={loading}
      >
        {loading && (
          <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        )}
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>
      {summary && (
        <div className="mt-8">
          <h3 className="font-semibold mb-2 text-blue-700 text-lg">Summary:</h3>
          <div className="whitespace-pre-wrap p-4 border-2 border-blue-200 rounded-xl bg-blue-50 text-base shadow-inner">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default Summarizer;
