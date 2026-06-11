import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { toMonthYearLabel } from '../../lib/calendarUtils'

/**
 * CalendarHeader
 *
 * Props:
 *   referenceDate  Date   — any date in the currently visible week/month
 *   onPrevMonth    fn     — called when user taps ‹
 *   onNextMonth    fn     — called when user taps ›
 *   onMonthPress   fn     — called when user taps the month/year label
 */
export default function CalendarHeader({ referenceDate, onPrevMonth, onNextMonth, onMonthPress }) {
  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-2">
      {/* Left: screen title */}
      <h1 className="text-white text-2xl font-bold tracking-tight">Hoy</h1>

      {/* Right: month navigator */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevMonth}
          className="p-1 text-white/60 active:text-white transition-colors"
          aria-label="Mes anterior"
        >
          <MdChevronLeft size={20} />
        </button>

        <button
          onClick={onMonthPress}
          className="text-white text-sm font-medium px-1 active:text-karga-orange transition-colors"
        >
          {toMonthYearLabel(referenceDate)}
        </button>

        <button
          onClick={onNextMonth}
          className="p-1 text-white/60 active:text-white transition-colors"
          aria-label="Mes siguiente"
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}