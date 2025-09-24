import * as React from "react"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Input } from "./input"

const SimpleDateTimePicker = React.forwardRef(({ 
  className, 
  value, 
  onChange, 
  placeholder = "Select date and time", 
  ...props 
}, ref) => {
  const [dateValue, setDateValue] = React.useState("")
  const [timeValue, setTimeValue] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      setDateValue(date.toISOString().split('T')[0])
      setTimeValue(date.toTimeString().split(' ')[0].substring(0, 5))
    }
  }, [value])

  const handleDateChange = (date) => {
    setDateValue(date)
    if (date && timeValue) {
      const newDateTime = new Date(`${date}T${timeValue}`)
      onChange(newDateTime)
    }
  }

  const handleTimeChange = (time) => {
    setTimeValue(time)
    if (dateValue && time) {
      const newDateTime = new Date(`${dateValue}T${time}`)
      onChange(newDateTime)
    }
  }

  const handleConfirm = () => {
    if (dateValue && timeValue) {
      const newDateTime = new Date(`${dateValue}T${timeValue}`)
      onChange(newDateTime)
    }
    setIsOpen(false)
  }

  const formatDisplayValue = () => {
    if (value) {
      const date = new Date(value)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return placeholder
  }

  return (
    <div className="relative">
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !value && "text-muted-foreground",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formatDisplayValue()}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 p-3 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={dateValue}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <Input
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={!dateValue || !timeValue}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
SimpleDateTimePicker.displayName = "SimpleDateTimePicker"

export { SimpleDateTimePicker }
