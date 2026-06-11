import formatSeconds from '../lib/formatSeconds';
import { useRestStore } from '../stores/restStore';
import { FiX } from 'react-icons/fi';
import { useEffect } from 'react';

function RestTimer() {
    const { restTime, deleteRest, continueRest, isRunning } = useRestStore();

    useEffect(() => {
      if (isRunning) {
        continueRest();
      }
    }, []);

  return (
    <div className='flex items-center justify-between px-4 gap-2'>
        <p className='text-xs text-gray-500'><span className='font-bold text-white text-lg'>{formatSeconds(restTime)} </span>    Proxima serie</p>
        <FiX onClick={deleteRest} />
    </div>
  )
}

export default RestTimer