import React from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const SLASearch = ({ 
  searchTerm, 
  onSearchChange,
  placeholder = "Search by ticket ID, category, or status..." 
}) => {
  const handleClear = () => {
    onSearchChange('')
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <FiX className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default SLASearch