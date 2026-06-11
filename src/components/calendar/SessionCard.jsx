import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { MdFitnessCenter } from 'react-icons/md'

function getDuration(startedAt, finishedAt) {
  const diffMs =
    new Date(finishedAt).getTime() -
    new Date(startedAt).getTime();

  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

export default function SessionCard({ session }) {
  const duration = getDuration(session.startedAt, session.finishedAt);

  return (
    <div className="flex items-center gap-3 bg-karga-gray rounded-2xl px-4 py-3.5 mx-4 my-2">
      {/* Icon */}
      <div className="bg-karga-orange rounded-full p-2 shrink-0">
        <MdFitnessCenter size={18} className="text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-white font-semibold text-lg truncate">{duration}</p>
        <p className="text-white/40 text-xs mt-0.5">{format(new Date(session.startedAt), 'EEEE, yyyy', { locale: es }).toUpperCase().slice(0, 1) +  format(new Date(session.startedAt), 'EEEE, yyyy', { locale: es }).toLowerCase().slice(1)}</p>
      </div>
    </div>
  )
}