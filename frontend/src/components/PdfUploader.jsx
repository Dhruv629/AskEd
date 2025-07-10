import React, { useState } from 'react';
import axios from 'axios';

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
      await axios.post('http://localhost:8080/upload', formData);
      onUploadSuccess(file.name); // inform parent component
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">Upload PDF</h2>
      <input type="file" onChange={handleFileChange} accept="application/pdf" className="mb-2" />
      <br />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
};

export default PdfUploader;
