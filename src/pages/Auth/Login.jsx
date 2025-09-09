import React, { useState } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, Checkbox } from '../../components/ui'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password, rememberMe })
  }


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Half - Login Form Section */}
        <div className="w-1/2 bg-gray-50 flex items-center justify-center pt-4 pb-4 px-12">
          <div className="w-full max-w-md">
        {/* Logo and Title Section */}
        <div className="text-center mb-8">
          {/* Dexian Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3">
              {/* Logo Image */}
              <img 
                src="/logos/dexian-logo.png" 
                alt="Dexian Logo" 
                className="w-12 h-12 object-contain"
              />
              <span className="text-2xl font-bold text-blue-600">Dexian</span>
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Log in to your Account
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back! Please enter your credentials:
          </p>
        </div>

        {/* Email and Password Form */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdEmail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="pl-10 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="pl-10 pr-10 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <MdVisibility className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="mr-2"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot Password?
                </a>
              </div>

                             {/* Login Button */}
                               <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl"
                >
                  Log in
                </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Creation Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create an account
            </Link>
          </p>
        </div>
        </div>
        </div>

        {/* Right Half - Image Section */}
        <div className="w-1/2 relative overflow-hidden">
          <img 
            src="/assets/login-right bg.png" 
            alt="Login visual" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
