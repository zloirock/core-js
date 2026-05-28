// identifier `_ref10` contains `_ref` as substring within the polyfill emit search
// range. multiple chained polyfills produce `_ref`, `_ref2`, ..., `_ref10` UIDs in the
// same scope. whole-identifier matching must not hit `_ref` inside `_ref10` when looking
// for the 10th `_ref` - the search counts whole-identifier matches via the original
// source slice (which carries no bindings yet). 3 different chained instance methods
// so each emits a distinct import and any miss is visible per-line
const a = arr.flat().at(-1);
const b = arr.flat().at(-1).includes(1);
const c = arr.flat().at(-1).includes(2).toString();
