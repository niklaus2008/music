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
    <div className={cn("relative w-full select-none touch-none", className)}>
      {/* 轨道背景 */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        {/* 已填充部分 */}
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* 隐藏原生 input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([Number(e.target.value)])}
        className="absolute inset-0 h-3 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:focus:outline-none [&::-webkit-slider-thumb]:focus:ring-2 [&::-webkit-slider-thumb]:focus:ring-pink-500/50"
      />
    </div>
  )
}

export { Slider }
