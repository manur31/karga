import { MdFitnessCenter } from 'react-icons/md'
import { toTimeLabel } from '../../lib/calendarUtils'

/**
 * SetsCard
 *
 * Displays one exercise group (all sets for a single exercise in a day).
 * Props:
 *   exerciseName   string
 *   sets           Array<{ rep, reps, weight }>
 *   SetsTime    Date | string | null   — startedAt of the parent Sets
 */
export default function SetsCard({ exerciseName, sets = [], SetsTime }) {
  const totalSets = sets.length
  const totalWeight = sets.reduce((acc, set) => acc + (set.weight ?? 0), 0)
  const timeLabel = SetsTime ? toTimeLabel(SetsTime) : null

  return (
    <div className="flex items-center gap-3 bg-karga-gray rounded-2xl px-4 py-3.5 mx-4">
      {/* Icon */}
      <div className="bg-karga-orange rounded-full p-2 shrink-0">
        <MdFitnessCenter size={18} className="text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{exerciseName}</p>
        <p className="text-white/40 text-xs mt-0.5">
          {totalSets} serie{totalSets !== 1 ? 's' : ''} • {totalWeight} kg
        </p>
      </div>

      {/* Time */}
      {timeLabel && (
        <span className="text-white/40 text-xs shrink-0">{timeLabel}</span>
      )}
    </div>
  )
}