import { useEffect, useRef, useState } from 'react'
import { MdChevronLeft, MdChevronRight, MdClose } from 'react-icons/md'
import { getNextMonth, getPrevMonth, toMonthYearLabel } from '../../lib/calendarUtils'
import MonthGrid from './MonthGrid'

/**
 * MonthModal — bottom sheet date picker
 *
 * Props:
 *   isOpen         bool
 *   selectedDate   string  — "yyyy-MM-dd"
 *   activeDates    Set<string>
 *   onSelectDate   fn(string)   — selects a date and closes modal
 *   onClose        fn           — closes without changing date
 */
export default function MonthModal({ isOpen, selectedDate, activeDates, onSelectDate, onClose }) {
  const [monthRef, setMonthRef] = useState(
    selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()
  )
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const prevOpen = useRef(false)

  // Sync monthRef when modal opens with a new selectedDate
  useEffect(() => {
    if (isOpen && selectedDate) {
      setMonthRef(new Date(selectedDate + 'T00:00:00'))
    }
  }, [isOpen, selectedDate])

  useEffect(() => {
    let t;
    if (isOpen && !prevOpen.current) {
      // Opening
      setVisible(true)
      // Small delay to ensure DOM is ready before CSS transition triggers
      setTimeout(() => setAnimating(true), 10)
    } else if (!isOpen && prevOpen.current) {
      // Closing
      setAnimating(false)
      t = setTimeout(() => setVisible(false), 320)
    }
    prevOpen.current = isOpen

    document.body.style.overflow = isOpen ? 'hidden' : 'auto'
    
    return () => {
      if (t) clearTimeout(t)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!visible) return null

  function handleSelectDate(dateStr) {
    onSelectDate(dateStr)
    // onSelectDate closes the modal via parent — no extra close call needed
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 ${isOpen ? 'overflow-hidden' : 'overflow-auto'} bg-black/60 z-60 transition-opacity duration-300
          ${animating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`absolute bottom-[9%] left-0 right-0 z-70 h-fit
          bg-karga-gray rounded-t-3xl
          ${isOpen ? 'overflow-hidden' : 'overflow-auto'}
          transition-transform duration-300 ease-out
          ${animating ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Month navigator */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMonthRef((m) => getPrevMonth(m))}
            className="p-1 text-white/50 active:text-white transition-colors"
          >
            <MdChevronLeft size={22} />
          </button>

          <span className="text-white font-semibold text-base">
            {toMonthYearLabel(monthRef)}
          </span>

          <button
            onClick={() => setMonthRef((m) => getNextMonth(m))}
            className="p-1 text-white/50 active:text-white transition-colors"
          >
            <MdChevronRight size={22} />
          </button>
        </div>

        {/* Grid */}
        <MonthGrid
          referenceDate={monthRef}
          selectedDate={selectedDate}
          activeDates={activeDates}
          onSelectDate={handleSelectDate}
        />

        {/* Bottom safe area padding */}
        <div className="h-6" />
      </div>
    </>
  )
}