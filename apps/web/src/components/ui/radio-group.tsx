"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

interface RadioGroupItemProps {
  value: string
  id?: string
  className?: string
  children: React.ReactNode
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

function RadioGroup({ value, onValueChange, className, children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div
        role="radiogroup"
        className={cn("flex gap-2", className)}
        {...(value !== undefined && { "data-value": value })}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

function RadioGroupItem({ value, id, className, children }: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext)
  const isSelected = context.value === value

  const handleClick = () => {
    context.onValueChange?.(value)
  }

  return (
    <button
      type="button"
      role="radio"
      id={id}
      aria-checked={isSelected}
      data-state={isSelected ? "checked" : "unchecked"}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-[color,background-color,border-color] duration-200 ease-in-out",
        "hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.98]",
        isSelected && "bg-primary text-primary-foreground border-primary",
        className
      )}
    >
      {children}
    </button>
  )
}

export { RadioGroup, RadioGroupItem }
