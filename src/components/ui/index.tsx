import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ── Button ──────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'admin';
        size?: 'xs' | 'sm' | 'md' | 'lg';
        loading?: boolean;
    }
>(({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-blue-200 hover:shadow-md',
        secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm',
        outline: 'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        admin: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-indigo-200 hover:shadow-md',
    };
    const sizes = {
        xs: 'px-2.5 py-1 text-xs gap-1',
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
    };
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {loading ? (
                <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {children}
                </>
            ) : children}
        </button>
    );
});
Button.displayName = 'Button';

// ── Input ───────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }
>(({ className, label, error, id, ...props }, ref) => {
    const innerId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={innerId} className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={innerId}
                className={cn(
                    'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
                    error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
});
Input.displayName = 'Input';

// ── Textarea ─────────────────────────────────────────────────────────────────

export const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => {
    const innerId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label htmlFor={innerId} className="text-sm font-medium text-slate-700">{label}</label>}
            <textarea
                ref={ref}
                id={innerId}
                className={cn(
                    'flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none',
                    className
                )}
                {...props}
            />
        </div>
    );
});
Textarea.displayName = 'Textarea';

// ── Select ──────────────────────────────────────────────────────────────────

export const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }
>(({ className, label, id, options, ...props }, ref) => {
    const innerId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label htmlFor={innerId} className="text-sm font-medium text-slate-700">{label}</label>}
            <select
                ref={ref}
                id={innerId}
                className={cn(
                    'flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
});
Select.displayName = 'Select';

// ── Badge ───────────────────────────────────────────────────────────────────

export const Badge = ({
    children,
    variant = 'default',
    size = 'sm',
}: {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
    size?: 'xs' | 'sm';
}) => {
    const variants = {
        default: 'bg-slate-100 text-slate-700 border border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200',
        error: 'bg-red-50 text-red-700 border border-red-200',
        info: 'bg-blue-50 text-blue-700 border border-blue-200',
        purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    };
    const sizes = { xs: 'px-1.5 py-0.5 text-[10px]', sm: 'px-2.5 py-0.5 text-xs' };
    return (
        <span className={cn('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size])}>
            {children}
        </span>
    );
};

// ── Card ─────────────────────────────────────────────────────────────────────

export const Card = ({
    children,
    className,
    hover = false,
}: {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}) => (
    <div
        className={cn(
            'bg-white rounded-2xl border border-slate-100 shadow-sm',
            hover && 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
            className
        )}
    >
        {children}
    </div>
);

// ── Modal ────────────────────────────────────────────────────────────────────

export const Modal = ({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeInUp max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

// ── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';
type Toast = { id: string; message: string; type: ToastType };

const toastIcons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
};
const toastStyles: Record<ToastType, string> = {
    success: 'border-l-4 border-emerald-400',
    error: 'border-l-4 border-red-400',
    warning: 'border-l-4 border-amber-400',
    info: 'border-l-4 border-blue-400',
};

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    }, []);

    const ToastContainer = () => (
        <div className="toast-container">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={cn(
                        'flex items-center gap-3 bg-white rounded-xl shadow-lg px-4 py-3 min-w-[280px] max-w-sm animate-fadeInUp',
                        toastStyles[t.type]
                    )}
                >
                    {toastIcons[t.type]}
                    <p className="text-sm font-medium text-slate-800 flex-1">{t.message}</p>
                    <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );

    return { toast, ToastContainer };
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

export const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('skeleton', className)} />
);

// ── Empty State ───────────────────────────────────────────────────────────────

export const EmptyState = ({
    icon,
    title,
    description,
    action,
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-slate-50 rounded-2xl mb-4 text-slate-300">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
        {description && <p className="text-sm text-slate-500 max-w-xs mb-4">{description}</p>}
        {action}
    </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────

export const StatCard = ({
    label,
    value,
    icon,
    color = 'blue',
    sub,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'rose';
    sub?: string;
}) => {
    const colors = {
        blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
        green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600' },
        purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
        orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', text: 'text-orange-600' },
        rose: { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', text: 'text-rose-600' },
    };
    const c = colors[color];
    return (
        <Card className={cn('p-5', c.bg)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
                </div>
                <div className={cn('p-2.5 rounded-xl', c.icon)}>{icon}</div>
            </div>
        </Card>
    );
};
