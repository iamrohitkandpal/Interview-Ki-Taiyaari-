
import React from 'react';

/**
 * Reusable Badge Component
 * 
 * Variants:
 * - default: Slate/Gray
 * - success: Green/Emerald
 * - warning: Yellow/Amber
 * - danger: Red/Rose
 * - info: Cyan/Blue
 * - purple: Purple/Violet
 */
export function Badge({
    children,
    variant = 'default',
    className = '',
    pulse = false
}) {
    const variants = {
        default: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    };

    const pulseColors = {
        default: "bg-slate-400",
        success: "bg-emerald-400",
        warning: "bg-amber-400",
        danger: "bg-rose-400",
        info: "bg-cyan-400",
        purple: "bg-purple-400"
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${variants[variant] || variants.default}
        ${className}
      `}
        >
            {pulse && (
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${pulseColors[variant] || pulseColors.default}`} />
            )}
            {children}
        </span>
    );
}

export default Badge;
