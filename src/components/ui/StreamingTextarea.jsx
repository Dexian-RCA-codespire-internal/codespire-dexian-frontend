import React, { useState, useEffect, useRef } from 'react'
import { Textarea } from './Textarea'
import { FiLoader, FiCheckCircle } from 'react-icons/fi'

const StreamingTextarea = ({
  value = '',
  onChange,
  placeholder = '',
  rows = 20,
  className = '',
  streaming = false,
  generating = false,
  streamingProgress = '',
  readOnly = false,
  type = 'default', // 'technical' or 'customer'
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value)
  const textareaRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    setIsStreaming(streaming && generating)
  }, [streaming, generating])

  const handleChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    if (onChange) {
      onChange(e)
    }
  }

  // Auto-scroll to bottom when content is being streamed
  useEffect(() => {
    if (isStreaming && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [localValue, isStreaming])

  // Prevent duplicate content during streaming
  useEffect(() => {
    if (streaming && generating && value && localValue !== value) {
      // Only update if the new value is longer (indicating new content)
      if (value.length > localValue.length) {
        setLocalValue(value)
      }
    } else if (!streaming || !generating) {
      // Always update when not streaming
      setLocalValue(value)
    }
  }, [value, streaming, generating])

  const getTypeColors = () => {
    switch (type) {
      case 'technical':
        return {
          spinner: 'text-blue-500',
          indicator: 'bg-blue-100 text-blue-800',
          border: 'border-blue-200'
        }
      case 'customer':
        return {
          spinner: 'text-green-500',
          indicator: 'bg-green-100 text-green-800',
          border: 'border-green-200'
        }
      default:
        return {
          spinner: 'text-gray-500',
          indicator: 'bg-gray-100 text-gray-800',
          border: 'border-gray-200'
        }
    }
  }

  const colors = getTypeColors()

  if (generating && !localValue) {
    return (
      <div className="flex h-96 flex-col items-center justify-center py-12 text-center">
        <FiLoader className={`w-8 h-8 ${colors.spinner} animate-spin mb-4`} />
        <p className="text-sm text-gray-600">
          AI Agent is building {type === 'technical' ? 'Technical RCA Report' : 'Customer-Friendly Summary'}
        </p>
        {streamingProgress && (
          <p className="text-xs text-gray-500 mt-2">{streamingProgress}</p>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full resize-none text-sm ${className}`}
        readOnly={readOnly || isStreaming}
        {...props}
      />
      
      {/* Streaming indicator */}
      {isStreaming && localValue && (
        <div className={`absolute bottom-2 right-2 flex items-center gap-2 ${colors.indicator} px-2 py-1 rounded text-xs`}>
          <FiLoader className="w-3 h-3 animate-spin" />
          Streaming...
        </div>
      )}
      
      {/* Content ready indicator */}
      {localValue && !isStreaming && (
        <div className="flex items-center text-sm text-green-600 mt-2">
          <FiCheckCircle className="w-4 h-4 mr-1" />
          {type === 'technical' ? 'Technical report ready' : 'Customer summary ready'}
        </div>
      )}
    </div>
  )
}

export { StreamingTextarea }
