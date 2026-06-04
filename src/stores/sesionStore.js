import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSesionStore = create(
    persist(
        (set, get) => ({
            sessions: [],
            seconds: 0,
            timer: null,
            startedAt: null,
            finishedAt: null,
            currentFunction: null,

            addSession: (newSession) => {(
                set((state) => ({
                    sessions: [...state.sessions, {
                            ...newSession,
                            id: crypto.randomUUID(),
                            synced: false,
                            createAt: new Date()
                        }
                    ]
                }))
            )},

            markAsSynced: (sessionId) => {
                set((state) => ({
                    sessions: state.sessions.map((session) => 
                        session.id === sessionId ? { ...session, synced: true } : session
                    )
                }))
            },

            getPendingSessions: () => get().sessions.filter((session) => !session.synced),

            start: () => {
                if(get().timer !== null || get().seconds !== 0) return

                const interval = setInterval(() => {
                    set({ seconds: get().seconds + 1 })
                }, 1000)

                set({ 
                    timer: interval, 
                    startedAt: new Date(),
                    finishedAt: null,
                    currentFunction: 'start'
                })
            },

            continue: () => {
                if(get().timer === null && get().seconds === 0) return

                const interval = setInterval(() => {
                    set({ seconds: get().seconds + 1 })
                }, 1000)

                set({ 
                    timer: interval, 
                    currentFunction: 'continue'
                })
            },

            pause: () => {
                clearInterval(get().timer)
                set({ timer: null, currentFunction: 'pause' })
            },

            finish: () => {
                clearInterval(get().timer)
                set({ 
                    timer: null, 
                    seconds: 0,
                    finishedAt: new Date() ,
                    currentFunction: 'finish'
                })

                // Add session to store
                get().addSession({
                    startedAt: get().startedAt,
                    finishedAt: get().finishedAt,
                })
            },

            discard: () => {
                clearInterval(get().timer)
                set({ 
                    timer: null, 
                    seconds: 0,
                    startedAt: null,
                    finishedAt: null,
                    currentFunction: 'discard'
                })
            }
        }), 
        { name: 'sesion-store' }
    )
)
