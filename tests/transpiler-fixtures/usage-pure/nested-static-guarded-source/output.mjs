import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _self from "@core-js/pure/actual/self";
// Fully consumed nested static slots keep the optional source check.
// A missing window throws before the computed key; a present source evaluates it once.
// The leading receiver effect stays ahead of the check and both extracted bindings.
const events = [];
let result;
try {
  const _ref = (_pushMaybeArray(events).call(events, 'source'), null == _globalThis.window ? void 0 : _self);
  const _ref2 = (null == _ref ? void 0 : _ref).Array;
  const from = null == _ref2 ? _ref2[""] : (_pushMaybeArray(events).call(events, 'key'), _Array$from);
  const keys = ((null == _ref ? void 0 : _ref).Object, _Object$keys);
  result = [from([7])[0], keys({
    x: 1
  })[0]];
} catch (error) {
  result = _nameMaybeFunction(error);
}
export { events, result };