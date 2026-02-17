
import React from 'react';

/**
 * Reusable Card Component for Bhisma Design System
 * 
 * Variants:
 * - glass: Standard glassmorphism panel (default)
 * - neon: Highlighted card with gradient border glow
 * - solid: Minimal card for lists/simple containers
 * - gradient: Subtle gradient background for variety
 * - stat: Special style for statistics with hover animation
 */
export function Card({
    children,
    variant = 'glass',
    className = '',
    onClick,
    ...props
}) {
    const baseStyles = "transition-all duration-300";

    const variants = {
        glass: "glass-panel",
        neon: "neon-card",
        solid: "solid-card",
        gradient: "gradient-card",
        stat: "stat-card",
        interactive: "glass-card cursor-pointer hover:translate-y-[-2px]"
    };

    const styleClass = variants[variant] || variants.glass;

    return (
        <div
            className={`${styleClass} ${baseStyles} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
