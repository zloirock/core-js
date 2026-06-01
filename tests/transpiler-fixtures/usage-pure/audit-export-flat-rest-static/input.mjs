// flat export + rest of a static: `export const { from, ...rest } = Array`. the static is
// polyfilled and the consumed key renames to `_unused` in the residual (a named export, like
// the nested-proxy export+rest path) instead of skipping and leaving `Array.from` native
export const { from, ...rest } = Array;
from([1]);
console.log(rest);
