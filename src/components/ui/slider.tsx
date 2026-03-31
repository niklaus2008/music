"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

function Slider({
  className,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
}: SliderProps) {
  const percentage = ((value[0] - min) / (max - min)) * 100

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute h-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([Number(e.target.value)])}
        className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ring [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:ring-ring/50"
      />
    </div>
  )
}

export { Slider }
