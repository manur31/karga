import { useEffect, useRef, useState } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import {
  generateWeek,
  getNextWeek,
  getPrevWeek,
  isInSameWeek,
  toDateKey,
  isSameDay,
} from '../../lib/calendarUtils'
import DayCell from './DayCell'

/**
 * WeeklyStrip
 * Props:
 *   selectedDate   string  — "yyyy-MM-dd"
 *   activeDates    Set<string>  — date keys that have activity
 *   onSelectDate   fn(string)  — called with "yyyy-MM-dd"
 */
export default function WeeklyStrip({ selectedDate, activeDates, onSelectDate }) {
  const selected = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()

  // The "anchor" date used to compute which week to show
  const [weekRef, setWeekRef] = useState(selected)

  const days = generateWeek(weekRef)
  const scrollRef = useRef(null)

  // When selectedDate changes from outside (e.g. MonthModal), sync the week
  useEffect(() => {
    const d = new Date(selectedDate + 'T00:00:00')
    if (!isInSameWeek(d, weekRef)) {
      setWeekRef(d)
    }
  }, [selectedDate])

  // Scroll strip to start on mount / week change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0
    }
  }, [weekRef])

  function handlePrevWeek() {
    setWeekRef((prev) => getPrevWeek(prev))
  }

  function handleNextWeek() {
    setWeekRef((prev) => getNextWeek(prev))
  }

  function handleSelectDay(date) {
    onSelectDate(toDateKey(date))
  }

  return (
    <div className="flex items-center gap-1 px-2">
      {/* Prev week */}
      <button
        onClick={handlePrevWeek}
        className="p-1 text-white/40 active:text-white transition-colors shrink-0"
        aria-label="Semana anterior"
      >
        <MdChevronLeft size={18} />
      </button>

      {/* Days strip */}
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto flex-1 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((day) => {
          const key = toDateKey(day)
          return (
            <DayCell
              key={key}
              date={day}
              isSelected={isSameDay(day, selected)}
              hasActivity={activeDates.has(key)}
              onSelect={handleSelectDay}
            />
          )
        })}
      </div>

      {/* Next week */}
      <button
        onClick={handleNextWeek}
        className="p-1 text-white/40 active:text-white transition-colors shrink-0"
        aria-label="Semana siguiente"
      >
        <MdChevronRight size={18} />
      </button>
    </div>
  )
}