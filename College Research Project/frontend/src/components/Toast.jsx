import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import useStore from '../store/useStore';

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: {
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        icon: 'text-emerald-400',
        bar: 'bg-emerald-500',
    },
    error: {
        bg: 'bg-red-500/10 border-red-500/30',
        icon: 'text-red-400',
        bar: 'bg-red-500',
    },
    warning: {
        bg: 'bg-amber-500/10 border-amber-500/30',
        icon: 'text-amber-400',
        bar: 'bg-amber-500',
    },
    info: {
        bg: 'bg-blue-500/10 border-blue-500/30',
        icon: 'text-blue-400',
        bar: 'bg-blue-500',
    },
};

const labels = {
    success: 'Success',
    error: 'Action needed',
    warning: 'Check this',
    info: 'Notice',
};

function Toast({ toast }) {
    const { removeToast } = useStore();
    const safeType = typeof toast?.type === 'string' ? toast.type : 'info';
    const safeMessage = typeof toast?.message === 'string' && toast.message.trim().length > 0
        ? toast.message
        : 'Notification';

    const Icon = icons[safeType] || icons.info;
    const color = colors[safeType] || colors.info;
    const label = labels[safeType] || labels.info;

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/30 ${color.bg} animate-toast-in min-w-75 max-w-105`}
            role="alert"
            aria-live="assertive"
        >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color.icon}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className="text-sm text-slate-100 leading-5">{safeMessage}</p>
            </div>
            <button
                onClick={() => removeToast(toast?.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function ToastContainer() {
    const { toasts } = useStore();

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed top-5 right-5 z-9999 flex flex-col gap-3"
            aria-label="Notifications"
        >
            {toasts.map((toast, index) => (
                <Toast key={toast?.id || `${index}-${toast?.message || 'toast'}`} toast={toast} />
            ))}
        </div>
    );
}
