import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const EmailVerificationSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmailWithToken(token);
    } else {
      setError('Invalid verification link - no token provided');
      setLoading(false);
    }
  }, [searchParams]);

  const verifyEmailWithToken = async (token) => {
    try {
      console.log('🔍 Verifying email with token:', token);
      
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
        setEmail(data.email || '');
        
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
        setError(data.message || data.error || 'Email verification failed');
      }
    } catch (err) {
      console.error('❌ Email verification error:', err);
      setError('Failed to verify email. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToLogin = () => {
    navigate('/login', { 
      state: { 
        message: '',
        email: email
      }
    });
  };

  const handleTryAgain = () => {
    navigate('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
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
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-2">{message}</p>
            {email && (
              <p className="text-sm text-gray-500 mb-4">
                Verified email: <strong>{email}</strong>
              </p>
            )}
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login page in a few seconds...
            </p>
            <Button
              onClick={handleRedirectToLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Go to Login
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={handleRedirectToLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Login
              </Button>
    
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
