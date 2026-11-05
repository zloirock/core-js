// Reusing an existing pure import does not make it a private receiver capture.
import max from '@core-js/pure/actual/number/max-safe-integer';
// Reusing a pre-existing pure import does not make its live binding a private capture.
let changed;
export const result = Number.MAX_SAFE_INTEGER?.[(changed = 1, 'toFixed')]((changed = 2, 0));
export { changed, max };
