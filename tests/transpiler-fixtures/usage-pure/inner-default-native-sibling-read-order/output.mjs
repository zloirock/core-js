import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Retain the actual inner-default receiver. Keys and repeated native reads keep their slots.
const events = [];
let _ref2 = false;
const [_ref = (_ref2 = true, _globalThis)] = [],
  {} = _ref,
  {
    Array: _ref3
  } = _ref2 ? {
    "Array": _globalThis.Array
  } : _ref,
  {} = _ref3,
  {
    of
  } = _ref2 ? {
    of: _Array$of
  } : _ref3,
  {
    [(_pushMaybeArray(events).call(events, 'key'), 'with-dash')]: dash
  } = _ref,
  {
    sibling: first
  } = _ref,
  {
    sibling: second
  } = _ref;
use(of(7), dash, first, second, events);