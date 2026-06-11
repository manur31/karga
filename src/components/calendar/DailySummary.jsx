import { MdFitnessCenter } from 'react-icons/md'
import { TbRepeat } from 'react-icons/tb'
import { GiMuscleUp } from 'react-icons/gi'

/**
 * DailySummary
 *
 * Props:
 *   metrics  { exercises: number, sets: number, reps: number }
 */
export default function DailySummary({ metrics }) {
  const { exercises = 0, sets = 0, reps = 0 } = metrics

  return (
    <div className="grid grid-cols-2 gap-3 px-4 mt-4">
      <MetricCard
        icon={<MdFitnessCenter size={22} className="text-karga-orange" />}
        iconBg="bg-karga-orange/15"
        value={exercises}
        label="EJERCICIOS"
      />
      <MetricCard
        icon={<TbRepeat size={22} className="text-[#e05555]" />}
        iconBg="bg-[#e05555]/15"
        value={sets}
        label="SERIES"
      />
    </div>
  )
}

function MetricCard({ icon, iconBg, value, label }) {
  return (
    <div className="bg-karga-gray rounded-2xl p-4 flex flex-col items-center gap-2">
      <div className={`${iconBg} rounded-full p-2`}>{icon}</div>
      <span className="text-white text-2xl font-bold leading-none">{value}</span>
      <span className="text-white/40 text-[10px] font-semibold tracking-widest">{label}</span>
    </div>
  )
}