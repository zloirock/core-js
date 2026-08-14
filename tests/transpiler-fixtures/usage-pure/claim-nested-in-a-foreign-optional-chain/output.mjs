import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a claim nested in an optional chain that is NOT its own: the argument, the computed key and a
// deeper hop all belong to the HOST's chain, so deoptionalizing the claim's `?.` must stop at the
// claim. reaching further seals the host's `?.` into parens - a call on `undefined` at runtime.
// the last two rows are the boundary: a claim ON the chain's own spine still deoptionalizes
const r1 = host?.fn(_Array$from([1]));
const r2 = host?.wrap[_Array$of(2).length];
const r3 = host?.a.b(_Promise$resolve(3));
const r4 = host?.fn?.(_Object$entries);
const r5 = null == _globalThis.window ? void 0 : _Array$from([4]);
const r6 = _at(list)?.call(list, 0);
console.log(r1, r2, r3, r4, r5, r6);