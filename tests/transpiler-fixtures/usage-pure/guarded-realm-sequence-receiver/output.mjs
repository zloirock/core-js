import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Symbol from "@core-js/pure/actual/symbol";
// A guarded realm read through a sequence prefix names the same receiver as the bare alias: the
// prefix runs once ahead of the identity test, the constructor takes its family entry (its statics
// are read through it), and a static under the constructor gets the captured-receiver guard.
export function readSymbol(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return (_pushMaybeArray(log).call(log, 'r'), realm === _globalThis ? _Symbol : realm.Symbol).iterator;
}
export function readStatic(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return (_pushMaybeArray(log).call(log, 'r'), realm === _globalThis ? _Map : realm.Map).groupBy;
}
export function callStatic(flag) {
  var _ref;
  if (flag) {
    var realm = _globalThis;
  }
  return _ref = (_pushMaybeArray(log).call(log, 'r'), realm).Array, _ref === Array ? _Array$of(7) : _ref.of(7);
}
export function pureSymbol(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  return (realm === _globalThis ? _Symbol : (0, realm).Symbol).iterator;
}
// A constructor read off the guarded realm and STORED whole is read through its binding, so the
// entry carries the statics itself.
export function heldStatic(flag) {
  if (flag) {
    var realm = _globalThis;
  }
  const held = realm === _globalThis ? _Map : realm.Map;
  return held.groupBy;
}