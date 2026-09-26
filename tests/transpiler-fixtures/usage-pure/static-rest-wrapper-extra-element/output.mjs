import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5, _unused;
// A nested static rest keeps its source and excludes the claimed key.
// Extra array elements run before the binding; the assignment yields the original array.
const events = [];
let held, from, rest;
const result = ([_ref] = _ref2 = [held = (_pushMaybeArray(events).call(events, 'source'), _globalThis), _pushMaybeArray(events).call(events, typeof from)], _ref3 = {
  Array: _ref4
} = _ref, _ref5 = _ref4, {} = _ref5, from = _Array$from, {
  from: _unused,
  ...rest
} = _ref5, _ref5, _ref3, _ref2);
export { events, held, from, rest, result };