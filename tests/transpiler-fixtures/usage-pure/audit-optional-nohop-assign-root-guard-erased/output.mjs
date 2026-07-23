import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2;
// an optional chain-assign root storing a proxy-global, with NO proxy hop (`(w = globalThis)?.Array.of(...)`),
// consumed by a trailing polyfilled dispatch. the `?.` guards only the always-defined receiver, so it is dead
// regardless of the (non-hop) member that follows - it erases and the receiver-independent collapse folds the
// assign SE ONCE, matching the static-call canon. before, a hop-key gate kept the dead guard: unplugin then
// re-folded the assign under it (SE twice), babel read a raw `_ref.Array.from` (missed polyfill) and the
// `.name` leg leaked a raw global. identifier + inline-call values; distinct trailer per line; both converge.
let w, v, u;
const g = () => _globalThis;
export const identStatic = _at(_ref = (w = _globalThis, _Array$of)(5)).call(_ref, 0);
export const identCtorName = _nameMaybeFunction((v = _globalThis, _Map));
export const callCtor = _includes(_ref2 = (u = g(), _Array$from)([1])).call(_ref2, 1);