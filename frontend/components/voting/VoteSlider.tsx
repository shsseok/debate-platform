'use client'

import { useRef, useState } from 'react'
import { sendVote } from '@/lib/stomp'

interface VoteSliderProps {
  roomId: string
}

export function VoteSlider({ roomId }: VoteSliderProps) {
  const [value, setValue] = useState(50)
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setValue(v)

    if (throttleRef.current) clearTimeout(throttleRef.current)
    throttleRef.current = setTimeout(() => {
      sendVote(roomId, v)
    }, 100)
  }

  const label = value < 40 ? '반대 쪽' : value > 60 ? '찬성 쪽' : '중립'
  const labelColor = value < 40 ? 'text-con' : value > 60 ? 'text-pro' : 'text-muted'

  return (
    <div className="bg-surface border border-border rounded-xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted">내 투표</p>
        <span className={`text-sm font-bold ${labelColor}`}>
          {value} <span className="font-normal text-xs text-muted">({label})</span>
        </span>
      </div>

      <div className="relative">
        {/* 슬라이더 트랙 배경 */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
          <div className="w-full h-2 rounded-full overflow-hidden flex">
            <div className="h-full bg-con/30" style={{ width: `${100 - value}%` }} />
            <div className="h-full bg-pro/30" style={{ width: `${value}%` }} />
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={handleChange}
          className="relative w-full h-2 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-primary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
        />
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-muted">
        <span className="text-con">0 반대</span>
        <span className="text-muted">50 중립</span>
        <span className="text-pro">100 찬성</span>
      </div>
    </div>
  )
}
