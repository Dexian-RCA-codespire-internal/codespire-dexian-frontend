import React, { useState, useRef, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { ticketService } from '../../api/services/ticketService.js'
import { useNavigate } from 'react-router-dom'

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [remoteSuggestions, setRemoteSuggestions] = useState([])
  const remoteFetchTimer = useRef(null)
  const navigate = useNavigate()
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchRemoteSuggestions = async (term) => {
    if (!term || !term.trim()) {
      setRemoteSuggestions([])
      return
    }

    try {
      const res = await ticketService.getTickets({ page: 1, limit: 8, query: term })
      const results = []
      const tList = (res && (res.data || res.results)) ? (res.data || res.results) : []

      if (Array.isArray(tList)) {
        const seen = new Set()
        tList.slice(0, 12).forEach(t => {
          const ticketIdVal = t.ticketId || t.ticket_id || t.number || ''
          if (!ticketIdVal) return
          if (seen.has(ticketIdVal)) return
          seen.add(ticketIdVal)

          const shortDesc = (t.short_description || t.description || '').toString().trim()
          const truncated = shortDesc.length > 120 ? `${shortDesc.slice(0, 117)}...` : shortDesc
          const displayText = `${ticketIdVal} — ${truncated || '(no description)'}`

          results.push({
            text: displayText,
            rawText: t.short_description || t.description || '',
            type: 'Ticket',
            source: t.source,
            id: t._id || t.id,
            ticketId: ticketIdVal
          })
        })
      }

      setRemoteSuggestions(results.slice(0, 8))
    } catch (err) {
      console.error('Error fetching remote suggestions (global):', err)
      setRemoteSuggestions([])
    }
  }

  const onSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.text)
    setShowSuggestions(false)

    if (suggestion.type === 'Ticket' && suggestion.ticketId) {
      // Navigate to RCA dashboard and highlight the ticket on the page where it appears
      navigate(`/rca-dashboard?search=${encodeURIComponent(suggestion.ticketId)}&highlightId=${encodeURIComponent(suggestion.ticketId)}`)
      return
    }

    if (suggestion.type === 'RCA' && (suggestion.id || suggestion.ticketId)) {
      const hid = suggestion.ticketId || suggestion.id
      navigate(`/rca-dashboard?search=${encodeURIComponent(suggestion.text)}&highlightId=${encodeURIComponent(hid)}`)
      return
    }

    // fallback: navigate to RCA dashboard with search query
    navigate(`/rca-dashboard?search=${encodeURIComponent(suggestion.text)}`)
  }

  return (
    <div ref={containerRef} className="relative w-96">
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const val = e.target.value
            setSearchTerm(val)
            setShowSuggestions(val.trim().length > 0)
            if (remoteFetchTimer.current) clearTimeout(remoteFetchTimer.current)
            remoteFetchTimer.current = setTimeout(() => fetchRemoteSuggestions(val), 300)
          }}
          onFocus={() => { if (searchTerm.trim()) { fetchRemoteSuggestions(searchTerm); setShowSuggestions(true) } }}
          placeholder="Search tickets, RCAs, IDs..."
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FiSearch className="text-lg" />
        </div>
      </div>

      {showSuggestions && remoteSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {remoteSuggestions.map((s, idx) => (
            <div
              key={idx}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => onSuggestionClick(s)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{s.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.type} {s.source ? `• ${s.source}` : ''}</div>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs">{s.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
