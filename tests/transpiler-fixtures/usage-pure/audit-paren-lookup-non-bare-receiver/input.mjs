// Non-bare receiver in paren-lookup-only path: `(getArr()?.at)(0)`. parenLookupOnly emits
// `(_ref == null ? void 0 : _at(_ref)).call(_ref, 0)` - the receiver call `getArr()` is
// memoized to `_ref` via the guard's assignment so it executes ONCE (matches native, which
// also evaluates the chain receiver once). Without memoization, naive emit would call
// `getArr()` three times. Distinct method per line so per-line dispatch is observable
declare const getArr: () => number[];
const a = (getArr()?.at)(0);
const b = (getArr()?.flat)();
