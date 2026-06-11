import { FiMoreVertical, FiPause, FiPlay, FiX } from "react-icons/fi";
import { useSesionStore } from "../stores/sesionStore";
import { useState } from "react";
import formatSeconds from "../lib/formatSeconds";
import { useCalendarStore } from "../stores/calendarStore";
import { useSyncSessions, useSyncSets } from "../hooks/useSync";
import { useAuth } from "../hooks/queries/useAuth";
import { useNavigate } from "react-router";

function SessionTimer({profile_id}) {
  const navigate = useNavigate();
  const {
    start,
    pause,
    discard,
    finish,
    seconds,
    continue: continueTimer,
    isStarted,
    startedAt,
    finishedAt,
    sessions
  } = useSesionStore();


  const { addLocalSessions } = useCalendarStore();
  const { sync: syncSessions } = useSyncSessions();
  const { sync: syncSets } = useSyncSets();

  const [isRunning, setIsRunning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);


  const handlePlayPause = () => {
    if (isRunning) {
      pause();
      setIsRunning(false);
    } else {
      if (isStarted) {
        continueTimer();
      } else {
        start();
      }

      setIsRunning(true);
    }
  };
  const handleDiscard = () => {
    discard();
    setIsRunning(false);
    setShowMenu(false);
  };

  const handleFinish = () => {
    finish(profile_id);
    setIsRunning(false);
    setShowMenu(false);
    syncSessions(profile_id);
    syncSets(profile_id);
    navigate('/today')
  };

  return (
    <section>
      <div className="flex items-center justify-between px-10">
        {isStarted ? (
          <p className="text-center text-xl font-medium tracking-widest tabular-nums text-white mb-1">
            {formatSeconds(seconds)}
          </p>
        ) : (
          <h2 className="text-lg font-bold text-white">Nueva Sesión</h2>
        )}

        <div className="flex items-center gap-2">
          {isRunning ? (
            <FiPause onClick={handlePlayPause} strokeWidth={3} />
          ) : (
            <FiPlay onClick={handlePlayPause} strokeWidth={3} />
          )}
          <div className="relative">
            <FiMoreVertical onClick={() => setShowMenu(!showMenu)} />
            <div>
              {showMenu && (
                <div className="absolute -top-20 right-0 bg-karga-gray py-2 px-4 rounded-lg flex flex-col gap-2 items-end">
                  <FiX onClick={() => setShowMenu(false)} />
                  <div className="flex flex-col gap-2">
                    <button
                      className="border-none bg-transparent text-white"
                      onClick={handleDiscard}
                    >
                      Descartar
                    </button>
                    <button
                      className="border-none bg-transparent text-white"
                      onClick={handleFinish}
                    >
                      Finalizar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SessionTimer;
