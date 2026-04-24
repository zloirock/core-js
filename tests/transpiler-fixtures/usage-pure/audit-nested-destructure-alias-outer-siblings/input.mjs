// outer pattern has siblings - `{ Array: { from }, Symbol } = globalThis`. flatten
// extracts `const from = _Array$from` above the declaration and drops the now-empty
// inner pattern plus the outer `Array:` property. `Symbol` remains in a single-sibling
// outer destructure which the existing top-level proxy-global path rewrites to
// `const Symbol = _Symbol`
const { Array: { from }, Symbol } = globalThis;
from([1]);
Symbol.iterator;
