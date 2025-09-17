import React, { useState, useRef, useEffect } from 'react'
import { FiMessageCircle, FiX, FiSend, FiMinimize2, FiMaximize2 } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useChat } from '../../hooks/useChat'

const ChatBot = ({ pageContext = null, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const inputRef = useRef(null)
  const chatBotRef = useRef(null)
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    initializeWelcomeMessage,
    messagesEndRef
  } = useChat(pageContext)

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, isMinimized])

  // Click outside to minimize ChatBot
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatBotRef.current && !chatBotRef.current.contains(event.target)) {
        if (isOpen && !isMinimized) {
          setIsMinimized(true)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const messageText = inputMessage.trim()
    setInputMessage('')
    await sendMessage(messageText)
  }



  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleChat = async () => {
    if (isOpen) {
      // When closing the chat, clear the conversation
      await clearChat()
    } else {
      // When opening the chat, initialize with welcome message
      await initializeWelcomeMessage()
    }
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <div ref={chatBotRef} className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <Card className={`w-80 h-96 bg-white shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'h-12' : 'h-96'
        }`}>
          <CardHeader className={`p-3 border-b border-gray-200 ${isMinimized ? 'pb-2' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <FiMessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-900">AI Assistant</CardTitle>
                  {!isMinimized && (
                    <p className="text-xs text-gray-500">Online</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimize}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  {isMinimized ? (
                    <FiMaximize2 className="w-3 h-3 text-gray-600" />
                  ) : (
                    <FiMinimize2 className="w-3 h-3 text-gray-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <FiX className="w-3 h-3 text-gray-600" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>

              {/* Messages */}
              <CardContent className="p-3 h-64 overflow-y-auto">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          message.type === 'user'
                            ? 'bg-green-600 text-white'
                            : message.isError
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Input */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white px-3"
                  >
                    <FiSend className="w-4 h-4" />
                  </Button>
                </div>
                {isLoading && (
                  <div className="text-xs text-gray-500 mt-1">
                    AI is thinking...
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <FiMessageCircle className="w-6 h-6" />
        </Button>
      )}
    </div>
  )
}

export default ChatBot
