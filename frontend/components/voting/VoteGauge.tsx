interface VoteGaugeProps {
  average: number   // 0.0 ~ 100.0 (찬성 비율)
  voterCount: number
  compact?: boolean
}

export function VoteGauge({ average, voterCount, compact = false }: VoteGaugeProps) {
  const proPercent = Math.round(average)
  const conPercent = 100 - proPercent

  const label =
    proPercent > 60 ? '찬성 우세' :
    proPercent < 40 ? '반대 우세' :
    '팽팽한 접전'

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-con font-medium w-6 text-right">{conPercent}</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-border flex">
          <div
            className="h-full bg-con transition-all duration-500"
            style={{ width: `${conPercent}%` }}
          />
          <div
            className="h-full bg-pro transition-all duration-500"
            style={{ width: `${proPercent}%` }}
          />
        </div>
        <span className="text-xs text-pro font-medium w-6">{proPercent}</span>
        <span className="text-[10px] text-muted ml-1">{voterCount}명</span>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted">실시간 여론</p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted">{voterCount}명 참여</span>
          <span className="text-xs font-medium text-white">{label}</span>
        </div>
      </div>

      {/* 게이지 바 */}
      <div className="h-4 rounded-full overflow-hidden bg-border flex">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-con transition-all duration-700 ease-out flex items-center justify-end pr-2"
          style={{ width: `${conPercent}%`, minWidth: conPercent > 0 ? '1.5rem' : 0 }}
        >
          {conPercent >= 15 && (
            <span className="text-[10px] text-white font-bold">{conPercent}%</span>
          )}
        </div>
        <div
          className="h-full bg-gradient-to-r from-pro to-blue-600 transition-all duration-700 ease-out flex items-center justify-start pl-2"
          style={{ width: `${proPercent}%`, minWidth: proPercent > 0 ? '1.5rem' : 0 }}
        >
          {proPercent >= 15 && (
            <span className="text-[10px] text-white font-bold">{proPercent}%</span>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-2 text-xs font-medium">
        <span className="text-con">반대 {conPercent}%</span>
        <span className="text-pro">찬성 {proPercent}%</span>
      </div>
    </div>
  )
}
