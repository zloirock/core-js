import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A sequence prefix at the chain root runs its effect exactly once in the guard test.
// The guarded branch then reads the static ponyfill.
let seCount = 0;
const eff = () => seCount++;
const k = () => _globalThis;
export const seRootKeepsRef = null == (eff(), k())?.window ? void 0 : _atMaybeArray(_ref = _Array$of(6)).call(_ref, 0);