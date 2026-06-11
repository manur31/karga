import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
    La idea es tener un store global para la UI
    Que controle los modales, los loaders, los alerts, etc.
*/

// export const useModalStore = create(
//   persist(
//     (set) => ({
//       isOpen: false,
//       setOpen: (open) => set({ isOpen: open }),
//     }),
//     {
//       name: 'modal-storage',
//     }
//   )
// )