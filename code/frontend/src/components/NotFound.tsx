import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/UseDocumentTitle.js';

const NotFound: React.FC = () => {
  useDocumentTitle('Notfound - AIChatApp');
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="text-blue-500 underline">
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;