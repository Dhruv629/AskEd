import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const summarizeText = async (text) => {
    const response = await axios.post('http://localhost:8080/ai/summarize', {
      inputText: text
    });
    return response.data;
  };

  const summarizeWithPrompt = async (text, customPrompt) => {
    const response = await axios.post('http://localhost:8080/ai/custom-summarize', {
      inputText: text,
      prompt: customPrompt
    });
    return response.data;
  };

  const handleDefaultSummarize = async () => {
    setError('');
    setSummary('');
    try {
      const result = await summarizeText(input);
      setSummary(result);
    } catch (err) {
      setError('Default summarization failed.');
    }
  };

  const handleCustomSummarize = async () => {
    setError('');
    setSummary('');
    try {
      const result = await summarizeWithPrompt(input, prompt);
      setSummary(result);
    } catch (err) {
      setError('Custom summarization failed.');
    }
  };

  return (
    <div className="App" style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      <h1>AskEd - Summarizer</h1>

      <textarea
        rows="6"
        cols="70"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your text here..."
      />
      <br /><br />

      <button onClick={handleDefaultSummarize}>Summarize</button>

      <hr />

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Custom prompt (e.g., Summarize in 5 points)"
        style={{ width: '100%' }}
      />
      <br /><br />
      <button onClick={handleCustomSummarize}>Custom Summarize</button>

      {summary && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
