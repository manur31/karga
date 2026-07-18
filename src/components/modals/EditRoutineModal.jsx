import { useState } from "react";
import { createPortal } from "react-dom";

export default function EditRoutineModal({
  isOpen,
  onClose,
  onSave,
  initialName = "",
  initialDescription = "",
}) {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialName, setPrevInitialName] = useState(initialName);
  const [prevInitialDescription, setPrevInitialDescription] = useState(initialDescription);

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");

  if (
    isOpen !== prevIsOpen ||
    initialName !== prevInitialName ||
    initialDescription !== prevInitialDescription
  ) {
    setPrevIsOpen(isOpen);
    setPrevInitialName(initialName);
    setPrevInitialDescription(initialDescription);
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setError("");
      setIsClosing(false);
    }
  }

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("El nombre de la rutina no puede estar vacío");
      return;
    }
    onSave({ name: name.trim(), description: description.trim() });
    handleClose();
  };

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-99 p-4 ${
        isClosing ? "animate-fade-out" : "animate-fade-in"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#2A2424] w-full max-w-sm rounded-3xl p-6 flex flex-col shadow-2xl border border-white/5 ${
          isClosing ? "animate-fade-out" : "animate-slide-in-up"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-black text-white mb-5">Editar rutina</h2>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
              Nombre de rutina
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ej: Empuje, Torso, Piernas..."
              maxLength={50}
              className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-4 py-3 text-sm focus:border-karga-orange focus:outline-none transition-all placeholder-zinc-600 font-medium"
            />
            {error && (
              <span className="text-red-500 text-xs font-semibold pl-1 mt-0.5 animate-fade-in">
                {error}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center pl-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Descripción
              </label>
              <span className="text-[10px] font-semibold text-zinc-600">
                {description.length}/200
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade una descripción breve o notas sobre esta rutina..."
              maxLength={200}
              rows={3}
              className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-4 py-3 text-sm focus:border-karga-orange focus:outline-none transition-all placeholder-zinc-600 resize-none font-medium leading-relaxed"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-karga-orange hover:bg-orange-600 transition-colors shadow-lg shadow-karga-orange/20 cursor-pointer text-sm"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
