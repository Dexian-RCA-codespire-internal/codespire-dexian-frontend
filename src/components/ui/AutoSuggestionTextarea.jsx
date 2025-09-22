import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Textarea } from './textarea'
import { autoSuggestionService } from '../../api'

const AutoSuggestionTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  rows = 8, 
  className = "w-full resize-none",
  reference = "",
  ...props 
}) => {
  const [suggestion, setSuggestion] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef(null)
  const debounceTimeoutRef = useRef(null)

  // Debounced function to get suggestions
  const getSuggestion = useCallback(async (currentText) => {
    if (!currentText || currentText.trim().split(/\s+/).length < 2) {
      setSuggestion('')
      setShowSuggestion(false)
      return
    }

    if (!reference) {
      setSuggestion('')
      setShowSuggestion(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await autoSuggestionService.getSuggestion({
        currentText,
        reference
      })

      if (response.success && response.suggestion) {
        setSuggestion(response.suggestion)
        setShowSuggestion(true)
      } else {
        setSuggestion('')
        setShowSuggestion(false)
      }
    } catch (error) {
      console.error('Failed to get suggestion:', error)
      setSuggestion('')
      setShowSuggestion(false)
    } finally {
      setIsLoading(false)
    }
  }, [reference])

  // Debounced effect for getting suggestions
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      getSuggestion(value)
    }, 400) // 400ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [value, getSuggestion])

  // Handle text change
  const handleChange = (e) => {
    const newValue = e.target.value
    const newCursorPosition = e.target.selectionStart
    setCursorPosition(newCursorPosition)
    onChange(newValue)
  }

  // Handle key events
  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && showSuggestion && suggestion) {
      e.preventDefault()
      acceptSuggestion()
    } else if (e.key === 'Escape') {
      setShowSuggestion(false)
    }
  }

  // Accept suggestion
  const acceptSuggestion = () => {
    if (suggestion) {
      const newValue = value + suggestion
      onChange(newValue)
      setShowSuggestion(false)
      setSuggestion('')
      
      // Focus back to textarea
      if (textareaRef.current) {
        textareaRef.current.focus()
        // Set cursor to end
        const newCursorPosition = newValue.length
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
      }
    }
  }

  // Handle click on suggestion
  const handleSuggestionClick = () => {
    acceptSuggestion()
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={className}
        {...props}
      />
      
      {/* Suggestion overlay */}
      {showSuggestion && suggestion && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300 p-2 text-gray-500 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex-1">
              <span className="text-gray-400">{value}</span>
              <span className="text-gray-600 font-medium">{suggestion}</span>
            </span>
            <div className="flex items-center space-x-2 ml-4">
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              )}
              <span className="text-xs text-gray-500">Press Tab to accept</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AutoSuggestionTextarea
