// mixed nested destructure - some inner props polyfillable (Array.from, Array.of), some
// not (Array.isArray isn't needed on our targets), plus a non-polyfill outer sibling
// (NaN). batch extracts the resolvable ones, leaves the rest in a trimmed destructure
const { Array: { from, of, isArray }, NaN: nan } = globalThis;
from([1]); of(1); isArray([1]); console.log(nan);
