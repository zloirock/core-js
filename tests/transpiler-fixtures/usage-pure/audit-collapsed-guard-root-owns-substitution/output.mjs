import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// the proxy root stays visitable only while the emitted text still carries it RAW. every render
// that spells the root itself - a paren-sealed guard test, a chain-assign whose hops the guard
// collapsed, an alias chain a ctor-static claim erases - owns that substitution, and a rewrite
// left queued on the deleted spelling has nowhere to compose. the last two rows are the negative:
// there the guard memo re-emits the root verbatim, so its own rewrite must stay live.
// `collapsedStatic` pins the receiver-guard channel against its sibling one line up: the SAME
// receiver under an instance claim and under a static one collapses its pristine hops the same
// way, or the guard TEST reads a raw hop off a root that does not carry it
const alias = _globalThis;
let assigned, kept, mid;
export const sealedRoot = null == (_ref = _globalThis.window) ? void 0 : _includesMaybeArray(_ref.Array.prototype).call([1], 1);
export const collapsedHops = _toFixedMaybeNumber(_ref2 = (assigned = _self, _Number$MAX_SAFE_INTEGER)).call(_ref2, 1);
export const collapsedStatic = null == (kept = _self) ? void 0 : _Map.length;
export const aliasCtorStatic = _toFixedMaybeNumber(_ref3 = _Number$MAX_SAFE_INTEGER).call(_ref3, 1);
export const rawGuardMemo = null == (_ref4 = _globalThis.baz) ? void 0 : _includes(_ref5 = _nameMaybeFunction(_ref4)).call(_ref5, 'z');
export const rawMidHop = null == (_ref6 = (mid = _globalThis).baz) ? void 0 : _includes(_ref7 = _nameMaybeFunction(_ref6)).call(_ref7, 'y');