import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-all duration-200">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} aria-label="Close modal overlay" />
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-modal-open"
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        {title && <h2 className="text-2xl font-bold mb-4 text-black">{title}</h2>}
        <div>{children}</div>
      </div>
      <style jsx>{`
        @keyframes modal-open {
          0% { transform: scale(0.95) translateY(30px); opacity: 0; }
          80% { transform: scale(1.02) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-modal-open {
          animation: modal-open 0.35s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default Modal; 