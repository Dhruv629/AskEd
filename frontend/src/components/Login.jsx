import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin, onSwitchToRegister, darkMode = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/auth/login', formData);
      const { token, username } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      
      // Call parent callback
      onLogin(token, username);
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 border rounded-2xl shadow-xl max-w-md mx-auto ${
      darkMode 
        ? 'bg-gray-800/90 text-white border-gray-600' 
        : 'bg-white/90 text-gray-900 border-gray-200'
    }`}>
      <h2 className={`text-2xl font-extrabold mb-6 tracking-tight text-center ${
        darkMode ? 'text-blue-300' : 'text-blue-700'
      }`}>Login</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className={`block font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${
              darkMode 
                ? 'border-gray-600 bg-gray-700 text-white focus:bg-gray-600' 
                : 'border-blue-200 bg-blue-50 focus:bg-white'
            }`}
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label htmlFor="password" className={`block font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${
              darkMode 
                ? 'border-gray-600 bg-gray-700 text-white focus:bg-gray-600' 
                : 'border-blue-200 bg-blue-50 focus:bg-white'
            }`}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white px-6 py-3 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:underline font-semibold focus:outline-none"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login; 