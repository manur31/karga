import { useState } from "react"
import { useSesionStore } from "../stores/sesionStore"

const fmtTime = (s) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":")
}

const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat("es-DO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(d)) : "-"

export default function SessionTester() {
  const { seconds, sessions, start, pause, continue: cont, finish, discard } = useSesionStore()
  const [uiState, setUiState] = useState(seconds === 0 ? "idle" : "paused")

  const handleMain = () => {
    if (uiState === "idle") { start(); setUiState("running") }
    else if (uiState === "running") { pause(); setUiState("paused") }
    else if (uiState === "paused") { cont(); setUiState("running") }
  }

  const handleFinish = () => { finish(); setUiState("idle") }
  const handleDiscard = () => { discard(); setUiState("idle") }

  const isIdle = uiState === "idle"
  const isRunning = uiState === "running"

  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <p className="text-center text-5xl font-medium tracking-widest tabular-nums text-gray-900 mb-1">
          {fmtTime(seconds)}
        </p>
        <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-6 h-4">
          {uiState === "idle" && "listo"}
          {uiState === "running" && "corriendo"}
          {uiState === "paused" && "pausado"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={handleDiscard} disabled={isIdle} title="Descartar"
            className="w-12 h-12 rounded-full border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 active:scale-95 transition disabled:opacity-25 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
          <button onClick={handleMain} title={isIdle ? "Iniciar" : isRunning ? "Pausar" : "Continuar"}
            className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 active:scale-95 transition">
            {isRunning ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
          <button onClick={handleFinish} disabled={isIdle} title="Finalizar"
            className="w-12 h-12 rounded-full border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition disabled:opacity-25 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        </div>
      </div>

      {sessions.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Sesiones registradas</p>
          <div className="space-y-2">
            {[...sessions].reverse().map((s) => (
              <div key={s.id} className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900 tabular-nums">
                    {fmtTime(Math.round((new Date(s.finishedAt) - new Date(s.startedAt)) / 1000))}
                  </p>
                  <p className="text-xs text-gray-400">{fmtDate(s.startedAt)} → {fmtDate(s.finishedAt)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.synced ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {s.synced ? "synced" : "pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}