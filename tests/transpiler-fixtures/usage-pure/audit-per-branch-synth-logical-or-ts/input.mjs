// each side of a `||` may be wrapped in TS casts; both branches must be
// unwrapped independently before the polyfill substitution kicks in,
// so a mixed shape (only the left branch cast) still resolves to `Array.from`.
const { from } = (Array as any) || Iterator;
from([1, 2]);
