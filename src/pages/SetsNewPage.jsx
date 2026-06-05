import { useState } from "react";
import { useRoutines } from "../hooks/queries/useRoutines";
import NewWorkoutModal from "../components/modals/NewWorkoutModal";
import { PlusIcon } from "../components/icons";

function SetsNewPage() {

  const { data: routines, isLoading } = useRoutines();
  const [openModal, setOpenModal] = useState(false);

  const handleClose = () => {
    setOpenModal(false)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  

  // console.log(routines)

  return (
    <main>
      <header>
        <h1 className="text-2xl font-bold text-white">My routines</h1>
      </header>
      <button onClick={() => setOpenModal(true)} className="text-karga-orange cursor-pointer mt-2 flex items-center gap-2 w-full">
        <PlusIcon className="stroke-karga-orange w-6 h-6" />
        <p className="border-b border-white/10 w-full text-start">New routine</p>
      </button>
      <div>
        { openModal && (
          <NewWorkoutModal onClose={handleClose} />
        )}
      </div>

      <section>
        {routines?.map((routine, index) => (
          <div key={index}>
            <h2>{routine.name}</h2>
          </div>
        ))}
      </section>
    </main>
  )
}

export default SetsNewPage