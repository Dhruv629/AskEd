import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h2 className="font-semibold mb-2">Error Details:</h2>
              <pre className="text-sm overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <h2 className="font-semibold mb-2">Component Stack:</h2>
              <pre className="text-sm overflow-auto">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 