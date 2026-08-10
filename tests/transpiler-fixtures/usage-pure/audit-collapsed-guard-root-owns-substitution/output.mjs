import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// the proxy root stays visitable only while the emitted text still carries it RAW. every render
// that spells the root itself - a paren-sealed guard test, a chain-assign whose hops the guard
// collapsed, an alias chain a ctor-static claim erases - owns that substitution, and a rewrite
// left queued on the deleted spelling has nowhere to compose. the last two rows are the negative:
// there the guard memo re-emits the root verbatim, so its own rewrite must stay live.
// `collapsedStatic` also records an OPEN divergence, not an intended shape: under a guarded STATIC
// claim the baseline substitutes the root but leaves the pristine hop above it raw, so the guard
// TEST itself reads through it. the sibling row one line up, same receiver, collapses on both
const alias = _globalThis;
let assigned, kept, mid;
export const sealedRoot = null == (_ref = _globalThis.window) ? void 0 : _includesMaybeArray(_ref.Array.prototype).call([1], 1);
export const collapsedHops = null == (_ref2 = assigned = _self.window) ? void 0 : _toFixedMaybeNumber(_ref3 = _Number$MAX_SAFE_INTEGER).call(_ref3, 1);
export const collapsedStatic = null == (kept = _globalThis.self.window) ? void 0 : _Map.length;
export const aliasCtorStatic = _toFixedMaybeNumber(_ref4 = _Number$MAX_SAFE_INTEGER).call(_ref4, 1);
export const rawGuardMemo = null == (_ref5 = _globalThis.baz) ? void 0 : _includes(_ref6 = _nameMaybeFunction(_ref5)).call(_ref6, 'z');
export const rawMidHop = null == (_ref7 = (mid = _globalThis).baz) ? void 0 : _includes(_ref8 = _nameMaybeFunction(_ref7)).call(_ref8, 'y');