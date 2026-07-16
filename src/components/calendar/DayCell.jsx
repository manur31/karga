import { toDayLabel, isToday, isSameDay } from '../../lib/calendarUtils'

/**
 * DayCell
 *
 * Props:
 *   date          Date     — the day this cell represents
 *   isSelected    bool
 *   hasActivity   bool     — show orange dot marker
 *   onSelect      fn(Date)
 */
export default function DayCell({ date, isSelected, hasActivity, onSelect }) {
  const today = isToday(date)
  const dayNumber = date.getDate()
  const dayLabel = toDayLabel(date)

  return ( 
    <button
      onClick={() => onSelect(date)}
      className="flex flex-col items-center gap-2 py-2 focus:outline-none"
    >
      {/* Day name */}
      <span
        className={`text-xs font-semibold tracking-widest transition-colors ${
          isSelected ? 'text-white' : 'text-white/40'
        }`}
      >
        {dayLabel}
      </span>

      {/* Number circle */}
      <div
        className={`
          relative w-10 h-10 rounded-xl flex items-center justify-center
          transition-all duration-200
          ${isSelected
            ? 'bg-karga-orange shadow-lg shadow-karga-orange/30'
            : today
            ? 'bg-white/10 ring-1 ring-white/20'
            : 'bg-transparent'
          }
        `}
      >
        <span
          className={`text-lg font-bold transition-colors ${
            isSelected ? 'text-white' : today ? 'text-white' : 'text-white/70'
          }`}
        >
          {dayNumber}
        </span>

        {/* Activity dot — shown only when NOT selected */}
        {hasActivity && !isSelected && (
          <span className="absolute  top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-8.5 h-8.5 rounded-lg bg-transparent border-2 border-karga-orange/20" />
        )}

        {/* Activity dot inside selected circle (white) */}
        {hasActivity && isSelected && (
          <span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-8.5 h-8.5 rounded-lg bg-transparent border-2 border-white/80" />
        )}
      </div>
    </button>
  )
}