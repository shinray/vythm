/**
 * Clamps value to a range.
 * @param {number} val value to clamp
 * @param {number} min minimum value
 * @param {number} max maximum value
 * @returns {number} clamped value
 */
function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

export { clamp };
