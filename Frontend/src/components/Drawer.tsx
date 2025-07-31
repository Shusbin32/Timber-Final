import React from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 transition-all duration-300">
      {/* Overlay */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Close drawer overlay"
      />
      {/* Drawer panel */}
      <div
        className="relative bg-white rounded-l-3xl shadow-2xl w-full max-w-2xl md:max-w-[50vw] h-[80vh] my-auto flex flex-col animate-drawer-slide"
        style={{ right: 0 }}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-3xl font-bold z-10"
          onClick={onClose}
          aria-label="Close drawer"
        >
          &times;
        </button>
        {title && <h2 className="text-2xl font-extrabold mb-6 mt-6 ml-8 text-yellow-900 tracking-tight">{title}</h2>}
        <div className="flex-1 overflow-y-auto px-8 pb-8">{children}</div>
      </div>
      <style jsx>{`
        @keyframes drawer-slide {
          0% { transform: translateX(100%) scale(0.98); opacity: 0.2; }
          80% { transform: translateX(-10px) scale(1.03); opacity: 1; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        .animate-drawer-slide {
          animation: drawer-slide 0.5s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default Drawer; 