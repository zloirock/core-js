import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a nav that collapses to a ponyfill under ONE probe owes no memo: the probe is the test and the
// claim reads the always-defined leaf inside the alternate, where a memo would spell a second test
// over the first. the negatives keep theirs - a value with a spelling that must run exactly once
// (a kept write, an effect-bearing sequence, an unknown binding) is what a memo exists for
let held, cb;
let se = 0;
const ga = _globalThis;
export const composesOverTheProbe = null == ga.window ? void 0 : _nameMaybeFunction(_atMaybeArray(_self.Array.prototype));
export const composesUnderACall = null == ga.window ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0);
export const keptWriteMemoizes = null == (held = ga.window) ? void 0 : _atMaybeArray(_ref2 = _Array$of(2)).call(_ref2, 0);
export const sequenceMemoizes = null == (se++, null == ga.window ? void 0 : _self) ? void 0 : _atMaybeArray(_ref3 = _Array$of(3)).call(_ref3, 0);
export const openBindingMemoizes = null == (_ref4 = cb?.self) ? void 0 : _at(_ref5 = _ref4.Array.of(4)).call(_ref5, 0);
export { held, cb, se };