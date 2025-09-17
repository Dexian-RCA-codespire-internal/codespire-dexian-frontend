import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFound = () => {
  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-red-500 mb-4">404</div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button className="px-8 py-3 text-base bg-primary-600 hover:bg-primary-700 text-white">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;