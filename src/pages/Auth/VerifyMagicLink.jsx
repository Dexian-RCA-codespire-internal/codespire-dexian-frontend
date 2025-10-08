import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

const VerifyMagicLink = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyMagicLink(token);
    } else {
      setError('Invalid verification link');
      setLoading(false);
    }
  }, [searchParams]);

  const verifyMagicLink = async (token) => {
    try {
      console.log('Verifying magic link token:', token);
      
      // Call the backend verify-email endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📧 Verification response:', data);

      if (response.ok && data.success) {
        setSuccess(true);
        setMessage(data.message || 'Email verified successfully!');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! Please log in to continue.',
              email: data.email
            }
          });
        }, 3000);
      } else {
        setError(data.message || data.error || 'Verification failed');
      }
    } catch (err) {
      console.error('Magic link verification error:', err);
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToLogin = () => {
    navigate('/login', { 
      state: { 
        message: '' 
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Email...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        {success ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login page in a few seconds...
            </p>
            <Button
              onClick={handleRedirectToLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Login
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="w-full"
              >
                Try Registration Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyMagicLink;