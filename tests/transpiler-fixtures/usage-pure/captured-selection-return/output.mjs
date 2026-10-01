import _Promise from "@core-js/pure/actual/promise";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A returned assignment keeps the chosen object while the binding receives its static.
export function read(shim) {
  let resolve;
  function capture() {
    var _ref;
    return _ref = shim || _Promise, resolve = _ref === _Promise ? _Promise$resolve : _ref.resolve, _ref;
  }
  return [capture(), resolve];
}