import React, { useState } from 'react';
import { Button, Card, CardContent } from '../../components/ui';
import { AlertCircle, CheckCircle, Mail, Smartphone, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function EmailVerificationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { sendEmailVerification, sendOTP, user } = useAuth();

  const handleSendMagicLink = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔗 Sending email verification magic link...');
      const result = await sendEmailVerification();
      
      if (result.success) {
        setSuccess('✅ Magic link sent! Please check your email inbox and click the verification link.');
      } else {
        if (result.status === 'EMAIL_ALREADY_VERIFIED_ERROR') {
          setSuccess('✅ Your email is already verified!');
        } else {
          setError(result.message || 'Failed to send magic link. Please try again.');
        }
      }
    } catch (err) {
      console.error('Magic link error:', err);
      setError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📱 Sending OTP...');
      const result = await sendOTP(user?.email || '');
      
      if (result.status === 'OK') {
        setSuccess('✅ OTP sent! Please check your email for the verification code.');
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP error:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Card className="bg-white border border-gray-100 shadow-sm rounded-lg">
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verification
              </h1>
              <p className="text-gray-600">
                Choose how you'd like to verify your email address
              </p>
              {user?.email && (
                <p className="text-sm text-gray-500 mt-2">
                  Sending to: <strong>{user.email}</strong>
                </p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {success}
                </div>
              </div>
            )}

            {/* Verification Options */}
            <div className="space-y-4">
              {/* Magic Link Option */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <LinkIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Magic Link</h3>
                      <p className="text-xs text-gray-500">Click a link in your email</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMagicLink}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                  >
                    {isLoading ? 'Sending...' : 'Send Link'}
                  </Button>
                </div>
              </div>

              {/* OTP Option */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">OTP Code</h3>
                      <p className="text-xs text-gray-500">Enter a 6-digit code</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                  >
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Helper Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                You can use either method to verify your email address. 
                Check your email inbox for the verification message.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}