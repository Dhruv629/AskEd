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
  const [mode, setMode] = useState('select'); // 'select', 'text', 'pdf'

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

  const handleBack = () => {
    setMode('select');
    setInputText('');
    setUploadedFilename('');
    setExtractedText('');
    setSummary('');
  };

  return (
    <div className="p-6 bg-white/90 border rounded-2xl shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold mb-6 text-blue-700 tracking-tight">Summarize Text or PDF</h2>
      {mode === 'select' && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200"
            onClick={() => setMode('text')}
          >
            Summarize Text
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200"
            onClick={() => setMode('pdf')}
          >
            Summarize PDF
          </button>
        </div>
      )}
      {mode !== 'select' && (
        <button
          className="mb-4 text-blue-600 hover:underline text-sm font-semibold focus:outline-none"
          onClick={handleBack}
        >
          &larr; Back
        </button>
      )}
      {mode === 'text' && (
        <div className="mb-6">
          <label className="block font-semibold mb-1 text-blue-900">Paste Text</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type your text here..."
            className="w-full p-3 border-2 border-blue-200 rounded-lg bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            rows={5}
          />
        </div>
      )}
      {mode === 'pdf' && (
        <div className="mb-6">
          <PdfUploader onUploadSuccess={handleUploadSuccess} />
          {uploadedFilename && !extractedText && (
            <PdfTextExtractor filename={uploadedFilename} onExtracted={handleExtracted} />
          )}
          {uploadedFilename && extractedText && (
            <div className="mt-2 text-xs text-green-700">PDF extracted and ready for summarization.</div>
          )}
        </div>
      )}
      {mode !== 'select' && (
        <div className="mb-6">
          <label className="block font-semibold mb-1 text-blue-900">Custom Prompt <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Summarize in bullet points"
            className="w-full p-2 border-2 border-blue-200 rounded-lg bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          <p className="text-xs text-gray-500 mt-1">You can guide the summary style, e.g., "Summarize in 5 bullet points".</p>
        </div>
      )}
      {mode !== 'select' && (
        <button
          onClick={handleSummarize}
          className="bg-green-600 hover:bg-green-700 transition-all duration-200 text-white px-6 py-2 rounded-lg font-semibold shadow flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading || (mode === 'text' ? !inputText : !extractedText)}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
      )}
      {summary && (
        <div className="mt-8">
          <h3 className="font-bold mb-2 text-blue-700 text-lg">Summary:</h3>
          <div className="whitespace-pre-wrap p-4 border-2 border-blue-200 rounded-xl bg-blue-50 text-base shadow-inner">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default Summarizer;
