import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FiLoader, FiCheckCircle, FiFileText, FiUsers, FiClock } from 'react-icons/fi'

const FormattedReport = ({
  value = '',
  placeholder = '',
  streaming = false,
  generating = false,
  streamingProgress = '',
  type = 'technical', // 'technical' or 'customer'
  waitingFor = null, // 'technical' or 'customer' - indicates which report this is waiting for
  otherReportGenerating = false, // indicates if the other report is currently generating
  className = '',
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value)
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastScrollHeight, setLastScrollHeight] = useState(0)
  const [debounceTimer, setDebounceTimer] = useState(null)
  const contentRef = useRef(null)
  const scrollTimeoutRef = useRef(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    setIsStreaming(streaming && generating)
  }, [streaming, generating])

  // Improved auto-scroll with smooth behavior
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      const element = contentRef.current
      const currentScrollHeight = element.scrollHeight

      // Only scroll if content has actually increased
      if (currentScrollHeight > lastScrollHeight) {
        // Clear any existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        // Smooth scroll to bottom with a small delay
        scrollTimeoutRef.current = setTimeout(() => {
          element.scrollTo({
            top: currentScrollHeight,
            behavior: 'smooth'
          })
        }, 50)

        setLastScrollHeight(currentScrollHeight)
      }
    }
  }, [localValue, isStreaming, lastScrollHeight])

  // Prevent duplicate content during streaming with debouncing for better performance
  useEffect(() => {
    if (streaming && generating && value && localValue !== value) {
      if (value.length > localValue.length) {
        // Clear existing timer
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }

        // Debounce updates to improve performance and smoothness
        const timer = setTimeout(() => {
          setLocalValue(value)
        }, 50) // 50ms debounce for smoother streaming

        setDebounceTimer(timer)
      }
    } else if (!streaming || !generating) {
      // Immediate update when not streaming
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        setDebounceTimer(null)
      }
      setLocalValue(value)
    }

    // Cleanup timer on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [value, streaming, generating, debounceTimer])

  const getTypeColors = () => {
    switch (type) {
      case 'technical':
        return {
          spinner: 'text-blue-500',
          indicator: 'bg-blue-100 text-blue-800',
          border: 'border-blue-200',
          header: 'text-blue-900',
          accent: 'text-blue-600',
          bg: 'bg-blue-50'
        }
      case 'customer':
        return {
          spinner: 'text-green-500',
          indicator: 'bg-green-100 text-green-800',
          border: 'border-green-200',
          header: 'text-green-900',
          accent: 'text-green-600',
          bg: 'bg-green-50'
        }
      default:
        return {
          spinner: 'text-gray-500',
          indicator: 'bg-gray-100 text-gray-800',
          border: 'border-gray-200',
          header: 'text-gray-900',
          accent: 'text-gray-600',
          bg: 'bg-gray-50'
        }
    }
  }

  const colors = getTypeColors()

  // Custom markdown components for proper styling
  const markdownComponents = {
    h1: ({ children }) => (
      <h1 className={`text-xl font-medium ${colors.header} mb-4 mt-6 first:mt-0 border-b-2 ${colors.border} pb-2`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`text-lg font-medium ${colors.header} mb-3 mt-5 first:mt-0 border-b-2 ${colors.border} pb-2`}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`text-base font-medium ${colors.header} mb-2 mt-4 first:mt-0 border-b ${colors.border} pb-1`}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={`text-sm font-medium ${colors.accent} mb-2 mt-3 italic bg-gray-50 px-2 py-1 rounded`}>
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className={`text-sm font-medium ${colors.accent} mb-1 mt-2`}>
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className={`text-xs font-medium ${colors.accent} mb-1 mt-2`}>
        {children}
      </h6>
    ),
    p: ({ children }) => (
      <p className="text-gray-700 mb-3 leading-relaxed text-sm">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mb-3 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-3 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="flex items-start ml-3">
        <span className={`inline-block w-1.5 h-1.5 ${colors.accent} rounded-full mt-2 mr-2 flex-shrink-0`}></span>
        <span className="text-gray-700 leading-relaxed text-sm">{children}</span>
      </li>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-3">
        <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className={`${colors.bg} ${colors.header}`}>
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-white">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-medium border-r border-gray-200 last:border-r-0 text-sm">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 border-r border-gray-200 last:border-r-0 text-sm">
        {children}
      </td>
    ),
    strong: ({ children }) => (
      <strong className={`font-medium ${colors.header}`}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className={`italic ${colors.accent}`}>
        {children}
      </em>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`border-l-4 ${colors.border} pl-3 py-2 my-3 bg-gray-50 italic ${colors.accent} text-sm`}>
        {children}
      </blockquote>
    ),
    code: ({ inline, children }) => (
      inline ? (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">
          {children}
        </code>
      ) : (
        <code className="block bg-gray-100 px-3 py-2 rounded-lg mb-2 font-mono text-xs text-gray-800 border-l-4 border-gray-400 whitespace-pre-wrap">
          {children}
        </code>
      )
    ),
    hr: () => (
      <hr className={`border-t-2 ${colors.border} my-4`} />
    )
  }

  // Enhanced loading state with better progress indication
  if (generating && !localValue) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center py-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="mb-6 relative">
          <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mb-4`}>
            {type === 'technical' ? (
              <FiFileText className={`w-8 h-8 ${colors.spinner}`} />
            ) : (
              <FiUsers className={`w-8 h-8 ${colors.spinner}`} />
            )}
          </div>
          <div className="absolute -top-1 -right-1">
            <FiLoader className={`w-6 h-6 ${colors.spinner} animate-spin`} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">
            AI Agent is analyzing and generating {type === 'technical' ? 'Technical RCA Report' : 'Customer-Friendly Summary'}
          </p>
          {streamingProgress && (
            <div className="flex items-center justify-center space-x-2">
              <FiClock className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-500 max-w-xs">{streamingProgress}</p>
            </div>
          )}
          <div className="flex justify-center space-x-1 mt-4">
            <div className={`w-2 h-2 ${colors.accent} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 ${colors.accent} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 ${colors.accent} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Waiting state when this report is waiting for another report to complete
  if (waitingFor && otherReportGenerating && !generating && !localValue) {
    const waitingColors = waitingFor === 'technical' ? {
      spinner: 'text-blue-500',
      indicator: 'bg-blue-100 text-blue-800',
      border: 'border-blue-200',
      header: 'text-blue-900',
      accent: 'text-blue-600',
      bg: 'bg-blue-50'
    } : {
      spinner: 'text-green-500',
      indicator: 'bg-green-100 text-green-800',
      border: 'border-green-200',
      header: 'text-green-900',
      accent: 'text-green-600',
      bg: 'bg-green-50'
    }

    return (
      <div className="flex h-[400px] flex-col items-center justify-center py-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="mb-6 relative">
          <div className={`w-16 h-16 ${waitingColors.bg} rounded-full flex items-center justify-center mb-4`}>
            {waitingFor === 'technical' ? (
              <FiFileText className={`w-8 h-8 ${waitingColors.spinner}`} />
            ) : (
              <FiUsers className={`w-8 h-8 ${waitingColors.spinner}`} />
            )}
          </div>
          <div className="absolute -top-1 -right-1">
            <FiClock className={`w-6 h-6 ${waitingColors.spinner}`} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">
            Preparing {type === 'technical' ? 'Technical Analysis' : 'Customer Summary'}
          </p>
          <p className="text-xs text-gray-500 max-w-xs">
            Waiting for {waitingFor === 'technical' ? 'technical report' : 'customer summary'} to complete...
          </p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className={`w-2 h-2 ${waitingColors.accent} rounded-full animate-pulse`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 ${waitingColors.accent} rounded-full animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
            <div className={`w-2 h-2 ${waitingColors.accent} rounded-full animate-pulse`} style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!localValue) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center py-6 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="mb-4">
          {type === 'technical' ? (
            <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          ) : (
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          )}
        </div>
        <p className="text-sm text-gray-500">{placeholder}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={`min-h-[400px] max-h-[60vh] overflow-y-auto p-3 bg-white border rounded-lg ${colors.border} ${className} shadow-sm`}
        {...props}
      >
        <div className="prose prose-xs max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
            data-type={type}
          >
            {localValue}
          </ReactMarkdown>
          <div className="h-4"></div>
        </div>

        {/* Enhanced streaming indicator */}
        {isStreaming && (
          <div className={`fixed bottom-4 right-4 flex items-center gap-2 ${colors.indicator} px-4 py-2 rounded-full text-xs font-medium shadow-lg z-10`}>
            <FiLoader className="w-4 h-4 animate-spin" />
            <span>Streaming live...</span>
            <div className="flex space-x-1 ml-2">
              <div className={`w-1 h-1 ${colors.accent} rounded-full animate-pulse`}></div>
              <div className={`w-1 h-1 ${colors.accent} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
              <div className={`w-1 h-1 ${colors.accent} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

   
    </div>
  )
}

export { FormattedReport }