/**
 * Shuffles an array in-place, using Fisher-Yates.
 * @param {T[]} array array to be shuffled
 * @param {number} [startIndex] starting index
 * @param {number} [endIndex] ending index
 * @param {Function} [onSwap] callback when two elements are swapped.
 */
function shuffleInPlace<T>(
    array: T[],
    startIndex?: number,
    endIndex?: number,
    onSwap?: (i: number, j: number) => void,
) {
    const start = startIndex ?? 0;
    const end = endIndex ?? array.length - 1;

    for (let i = end; i > start; i -= 1) {
        const j = start + Math.floor(Math.random() * (i - start + 1));
        // Swap the elements at i and j. Mutate the array.
        // eslint-disable-next-line no-param-reassign
        [array[i], array[j]] = [array[j], array[i]];
        if (onSwap) onSwap(i, j);
    }
}

export { shuffleInPlace };
