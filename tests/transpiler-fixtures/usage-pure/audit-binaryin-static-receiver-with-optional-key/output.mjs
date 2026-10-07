import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// `'from' in (Array ?? Object)` reads its decided left - `Array` always yields - and folds like `'from' in
// Array`, as does a left the build serves off the realm (`globalThis.Number`, which core-js extends in place);
// over a left it does not serve (`globalThis.WeakRef`) the test cannot fold to a single static receiver and
// stays raw, though only the right has the key. The `Array.from` / `Object.fromEntries` usages in the
// following statements get polyfilled independently either way.
const a = true;
const b = _Array$from(src);
const c = _Object$fromEntries(pairs);
export { a, b, c };
const d = true;
export { d };
const e = 'groupBy' in (_globalThis.WeakRef ?? Object);
export { e };