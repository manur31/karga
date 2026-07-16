import {
  generateMonthGrid,
  toDateKey,
  isSameDay,
  isSameMonth,
  isToday,
} from '../../lib/calendarUtils'

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/**
 * MonthGrid
 *
 * Props:
 *   referenceDate  Date      — any date in the target month
 *   selectedDate   string    — "yyyy-MM-dd"
 *   activeDates    Set<string>
 *   onSelectDate   fn(string)
 */
export default function MonthGrid({ referenceDate, selectedDate, activeDates, onSelectDate }) {
  const days = generateMonthGrid(referenceDate)
  const selected = selectedDate ? new Date(selectedDate + 'T00:00:00') : null

  return (
    <div className="px-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <span
            key={d}
            className="text-center text-xs font-semibold text-white/30 tracking-widest py-1"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key = toDateKey(day)
          const inMonth = isSameMonth(day, referenceDate)
          const isSelected = selected ? isSameDay(day, selected) : false
          const hasActivity = activeDates.has(key)
          const today = isToday(day)

          return (
            <MonthDayCell
              key={key}
              day={day}
              inMonth={inMonth}
              isSelected={isSelected}
              hasActivity={hasActivity}
              isToday={today}
              onSelect={() => onSelectDate(key)}
            />
          )
        })}
      </div>
    </div>
  )
}

function MonthDayCell({ day, inMonth, isSelected, hasActivity, isToday, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`
        flex flex-col items-center justify-center h-9 rounded-xl transition-all duration-150
        focus:outline-none
        ${!inMonth ? 'opacity-20' : ''}
        ${isSelected ? 'bg-karga-orange' : isToday ? 'bg-white/10' : 'active:bg-white/5'}
      `}
    >
      <span
        className={`text-sm font-semibold leading-none ${
          isSelected ? 'text-white' : inMonth ? 'text-white/80' : 'text-white/30'
        }`}
      >
        {day.getDate()}
      </span>

      {/* Activity dot */}
      <span
        className={`mt-0.75 w-1 h-1 rounded-full transition-opacity ${
          hasActivity
            ? isSelected
              ? 'bg-white/70 opacity-100'
              : 'bg-karga-orange opacity-100'
            : 'opacity-0'
        }`}
      />
    </button>
  )
}