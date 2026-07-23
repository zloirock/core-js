import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// a chain-assign whose VALUE is an inline CALL resolving to a proxy-global (`(w = f())?.self.X`,
// `f = () => globalThis`): the assign RESULT is as always-defined as a bare `globalThis` once substituted, so
// the `?.` is DEAD and erases in step with the receiver collapse (`resolveObjectName` inlines the callee) -
// a kept guard would leave babel a raw static and unplugin a re-run of the call in the fold. distinct method.
let w;
const f = () => _globalThis;
export const staticCall = (w = f(), _Array$of)(1, 2);
export const instanceTail = _at(_ref = (w = f(), _Array$from)([3])).call(_ref, 0);
export const proto = (w = f(), _Set).prototype.has.call(new _Set([1]), 1);