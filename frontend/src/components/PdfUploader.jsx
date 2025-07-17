import React, { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../utils/api';

const PdfUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post(getApiUrl('/upload'), formData);
      onUploadSuccess(file.name); // inform parent component
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-blue-200 rounded-xl shadow bg-white/90 mb-4">
      <h2 className="text-lg font-bold mb-2 text-blue-700">Upload PDF</h2>
      <input type="file" onChange={handleFileChange} accept="application/pdf" className="mb-2 block w-full text-sm text-blue-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white px-4 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
};

export default PdfUploader;
