import React, { useState } from 'react';
import axios from 'axios';

const Home = ({ onNavigateToSummarizer, onNavigateToFlashcards }) => {
  const [inputMethod, setInputMethod] = useState('text'); // 'text' or 'pdf'
  const [textContent, setTextContent] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
    setTextContent(''); // Clear text when file is selected
  };

  const handleTextChange = (e) => {
    setTextContent(e.target.value);
    setPdfFile(null); // Clear file when text is entered
  };

  const handleUpload = async () => {
    if (!pdfFile) return;

    const formData = new FormData();
    formData.append('file', pdfFile);

    setUploading(true);
    setError('');
    try {
      await axios.post('http://localhost:8080/upload', formData);
      setUploadedFilename(pdfFile.name);
      
      // Automatically extract text after upload
      await extractTextFromPDF(pdfFile.name);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const extractTextFromPDF = async (filename) => {
    try {
      const res = await axios.get(`http://localhost:8080/extract?filename=${filename}`);
      setExtractedText(res.data);
    } catch (err) {
      console.error("Failed to extract:", err);
      setError("Failed to extract text from PDF");
    }
  };

  const getContentForProcessing = () => {
    if (inputMethod === 'text') {
      return textContent;
    } else {
      return extractedText || textContent;
    }
  };

  const handleGenerateSummary = () => {
    const content = getContentForProcessing();
    if (!content.trim()) {
      setError('Please provide text content or upload a PDF');
      return;
    }
    onNavigateToSummarizer(content);
  };

  const handleGenerateFlashcards = () => {
    const content = getContentForProcessing();
    if (!content.trim()) {
      setError('Please provide text content or upload a PDF');
      return;
    }
    onNavigateToFlashcards(content, inputMethod === 'pdf' ? uploadedFilename : null);
  };

  return (
    <div className="p-6 bg-white/90 border rounded-2xl shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold mb-6 text-blue-700 tracking-tight text-center">Welcome to AskEd AI</h2>
      <p className="text-gray-600 text-center mb-8">Upload a PDF or add text, then choose what you'd like to generate</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Input Method Selection */}
      <div className="mb-6">
        <div className="flex gap-4 justify-center mb-4">
          <button
            onClick={() => setInputMethod('text')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              inputMethod === 'text'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Add Text
          </button>
          <button
            onClick={() => setInputMethod('pdf')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              inputMethod === 'pdf'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upload PDF
          </button>
        </div>
      </div>

      {/* Text Input */}
      {inputMethod === 'text' && (
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-blue-900">Text Content</label>
          <textarea
            value={textContent}
            onChange={handleTextChange}
            placeholder="Paste or type your text here..."
            className="w-full p-3 border-2 border-blue-200 rounded-lg bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            rows={6}
          />
          <p className="text-xs text-gray-500 mt-1">This text will be used for summarization or flashcard generation</p>
        </div>
      )}

      {/* PDF Upload */}
      {inputMethod === 'pdf' && (
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-blue-900">Upload PDF</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            className="w-full p-3 border-2 border-blue-200 rounded-lg bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          <p className="text-xs text-gray-500 mt-1">Upload a PDF file to extract text and generate content</p>
          
          {pdfFile && (
            <div className="mt-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white px-4 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          )}

          {uploadedFilename && (
            <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
              ✓ PDF uploaded: {uploadedFilename}
            </div>
          )}

          {extractedText && (
            <div className="mt-4">
              <label className="block font-semibold mb-2 text-blue-900">Extracted Text</label>
              <div className="p-3 border-2 border-blue-200 rounded-lg bg-blue-50 max-h-32 overflow-y-auto text-sm">
                {extractedText.substring(0, 200)}...
              </div>
              <p className="text-xs text-gray-500 mt-1">Text extracted from PDF (showing first 200 characters)</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleGenerateSummary}
          disabled={loading || (!textContent.trim() && !extractedText.trim())}
          className="bg-green-600 hover:bg-green-700 transition-all duration-200 text-white px-6 py-3 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          📝 Generate Summary
        </button>
        
        <button
          onClick={handleGenerateFlashcards}
          disabled={loading || (!textContent.trim() && !extractedText.trim())}
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white px-6 py-3 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          🎯 Generate Flashcards
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Choose your preferred action based on the content you've provided</p>
      </div>
    </div>
  );
};

export default Home; 