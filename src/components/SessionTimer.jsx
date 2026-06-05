import { FiMoreVertical, FiPause, FiPlay, FiX } from 'react-icons/fi'
import { useSesionStore } from '../stores/sesionStore'
import { useState } from 'react'

function SessionTimer() {
    const { start, pause, discard, finish, seconds, continue: continueTimer, isStarted } = useSesionStore();
    const [isRunning, setIsRunning] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const fmtTime = (seconds) => {
        const hour = Math.floor(seconds / 3600)
        const minute = Math.floor((seconds % 3600) / 60)
        const sec = seconds % 60
        return [hour, minute, sec].map((n) => String(n).padStart(2, "0")).join(":")
    }
    
    const handlePause = () => {
        if(isRunning) {
            setIsRunning(false)
            pause()
        } else {
            start()
        }
    }

    const handleDiscard = () => {
        discard()
        setIsRunning(false)
        setShowMenu(false)
    }
    
    const handleFinish = () => {
        finish()
        setIsRunning(false)
        setShowMenu(false)
    }
    
  return (
    <section>
        <div className='flex items-center justify-between px-10'>
            
            {isStarted ? (<p className="text-center text-xl font-medium tracking-widest tabular-nums text-white mb-1">
                {fmtTime(seconds)}
            </p>) : (<h2>Session Timer</h2>)}

            <div className='flex items-center gap-2'>
                {isRunning ? (
                    <FiPause onClick={handlePause}/>
                ) : (
                    <FiPlay onClick={handleStart}/>
                )}
                <div className='relative'>
                    <FiMoreVertical onClick={() => setShowMenu(!showMenu)}/>
                    <div>
                        {showMenu && (
                            <div className='absolute -top-20 right-0 bg-karga-gray py-2 px-4 rounded-lg flex flex-col gap-2 items-end'>
                                <FiX onClick={() => setShowMenu(false)}/>
                                <div className='flex flex-col gap-2'>
                                    <button className='border-none bg-transparent text-white' onClick={handleDiscard}>Discard</button>
                                    <button className='border-none bg-transparent text-white' onClick={handleFinish}>Finish</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>


    </section>
  )
}

export default SessionTimer