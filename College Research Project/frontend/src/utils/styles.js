
/**
 * Bhisma Style Utilities
 * Centralized logic for colors, badges, and risk indicators
 */

/**
 * Returns the Tailwind text color class based on risk score (0-100)
 * @param {number} score - Risk score (0-100, where 100 is critical)
 * @returns {string} Tailwind class string
 */
export const getRiskColor = (score) => {
    if (score === null || score === undefined) return 'text-slate-400';
    if (score >= 70) return 'text-rose-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-emerald-400';
};

/**
 * Returns the Badge variant based on risk level string or score
 * @param {string|number} level - 'CRITICAL', 'HIGH', or score number
 * @returns {string} Badge variant name ('danger', 'warning', 'success')
 */
export const getRiskBadgeVariant = (level) => {
    if (typeof level === 'number') {
        if (level >= 70) return 'danger';
        if (level >= 40) return 'warning';
        return 'success';
    }

    const l = (level || '').toUpperCase();
    if (l === 'CRITICAL' || l === 'HIGH') return 'danger';
    if (l === 'MEDIUM') return 'warning';
    if (l === 'LOW' || l === 'SAFE') return 'success';
    return 'default';
};

/**
 * Returns the color palette for a defense/attack category
 * @param {string} category 
 * @returns {Object} Object with bg, text, border classes or specific color name
 */
export const getCategoryColor = (category) => {
    const cat = (category || '').toLowerCase();

    switch (cat) {
        case 'prompt':
        case 'injection':
            return 'info'; // Cyan
        case 'filter':
        case 'jailbreak':
            return 'purple'; // Purple
        case 'output':
        case 'leakage':
            return 'success'; // Green
        case 'detection':
        case 'defense':
            return 'warning'; // Yellow
        case 'limit':
        case 'dos':
            return 'danger'; // Red
        default:
            return 'default'; // Slate
    }
};

/**
 * Returns a human-readable label for the risk score
 * @param {number} score 
 */
export const getRiskLabel = (score) => {
    if (score === null || score === undefined) return 'UNKNOWN';
    if (score >= 90) return 'CRITICAL';
    if (score >= 70) return 'HIGH RISK';
    if (score >= 40) return 'MEDIUM RISK';
    return 'LOW RISK';
};
