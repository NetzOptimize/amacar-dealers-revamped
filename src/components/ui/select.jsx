import * as React from "react"
import { cn } from "@/lib/utils"

// Create context for Select
const SelectContext = React.createContext({
  value: '',
  onValueChange: () => {},
  options: []
})

// Select Root - context provider that collects options
const Select = ({ value, onValueChange, children, ...props }) => {
  const [options, setOptions] = React.useState([])
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, options, setOptions }}>
      {children}
    </SelectContext.Provider>
  )
}

// SelectTrigger - renders the actual select element with all options
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { value, onValueChange, options } = React.useContext(SelectContext)
  
  return (
    <select
      ref={ref}
      value={value || ''}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat pr-10",
        className
      )}
      {...props}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
})
SelectTrigger.displayName = "SelectTrigger"

// SelectValue - no-op for native select (just used for placeholder text, handled by select)
const SelectValue = ({ placeholder, ...props }) => {
  return null
}

// SelectContent - collects SelectItems and registers them
const SelectContent = ({ children, ...props }) => {
  const { setOptions } = React.useContext(SelectContext)
  const options = React.useRef([])
  
  React.useEffect(() => {
    // Extract options from children
    const extractedOptions = []
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectItem) {
        extractedOptions.push({
          value: child.props.value,
          label: child.props.children
        })
      }
    })
    setOptions(extractedOptions)
  }, [children, setOptions])
  
  return null
}

// SelectItem - just registers itself, doesn't render directly
const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  return null
})
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}

