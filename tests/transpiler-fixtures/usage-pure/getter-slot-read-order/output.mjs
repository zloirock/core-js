import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Getter-supplied realm values are evaluated once before a nested constructor is bound or assigned.
// Direct, aliased and assignment hosts preserve the getter's observed binding value.
export function direct(log) {
  const {
      w: _ref
    } = {
      get w() {
        _pushMaybeArray(log).call(log, 'direct');
        return _globalThis;
      }
    },
    Value = _ref === _globalThis ? _WeakSet : _ref.WeakSet;
  return Value;
}
export function aliased(log) {
  const source = {
    get w() {
      _pushMaybeArray(log).call(log, 'alias');
      return _globalThis;
    }
  };
  const {
      w: _ref2
    } = source,
    Value = _ref2 === _globalThis ? _WeakMap : _ref2.WeakMap;
  return Value;
}
export function assigned(log) {
  var _ref3;
  let Value = 'before';
  ({
    w: _ref3
  } = {
    get w() {
      _pushMaybeArray(log).call(log, Value);
      return _globalThis;
    }
  }), Value = _ref3 === _globalThis ? _Map : _ref3.Map;
  return Value;
}