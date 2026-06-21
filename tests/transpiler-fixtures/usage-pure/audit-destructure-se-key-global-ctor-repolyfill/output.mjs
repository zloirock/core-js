import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a side-effect computed key whose value is a destructured GLOBAL constructor (`{ [(eff(),
// "Promise")]: P } = globalThis`): extract `const P = _Promise` (the pure ctor) and keep the
// SE-key as a `_unused` residual so the effect runs in order. `P` stays a global alias so reads
// re-polyfill (`P.allSettled`); binding the pure ctor keeps the static and `new P` on ie:11.
let log = [];
const P = _Promise;
const {
  [(_pushMaybeArray(log).call(log, 1), "Promise")]: _unused
} = _globalThis;
const settled = _Promise$allSettled([]);
const pending = new P(resolve => resolve());
export { log, settled, pending };