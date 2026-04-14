// Spinner
export const Spinner = ({ size = "md" }) => {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }[size];
  return <div className={`${s} border-2 border-brand-500 border-t-transparent rounded-full animate-spin`} />;
};

// Empty state
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-slate-300 mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
);

// Toast notification
export const Toast = ({ message, type = "success", onClose }) => {
  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-fade-in ${colors[type]}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

// Modal
export const Modal = ({ title, children, onClose, maxWidth = "max-w-lg" }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} animate-fade-in`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="font-display font-semibold text-slate-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// Avatar
export const Avatar = ({ name, src, size = "md" }) => {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
  const initials = name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-brand-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
};

// Badge
export const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    live: "bg-red-500 text-white",
  };
  return <span className={`badge ${variants[variant]}`}>{children}</span>;
};

// Confirm dialog
export const Confirm = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fade-in p-6">
      <p className="text-slate-700 text-sm mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
        <button onClick={onConfirm} className="btn-danger text-sm">Confirm</button>
      </div>
    </div>
  </div>
);
