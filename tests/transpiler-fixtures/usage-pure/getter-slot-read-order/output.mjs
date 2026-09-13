import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// A kept getter runs before its destructured binding initializes. Its returned realm still
// supplies a polyfilled constructor, through a direct literal, an alias and an assignment.
// The assignment getter observes the old binding, then the assignment installs the ponyfill.
// A constructor escaping through the getter includes its static methods.
export function direct(log) {
  const {
    w: {
      WeakSet: Value
    }
  } = {
    get w() {
      _pushMaybeArray(log).call(log, 'direct');
      return {
        WeakSet: _WeakSet
      };
    }
  };
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
      w: _ref
    } = source,
    Value = _ref === _globalThis ? _WeakMap : _ref.WeakMap;
  return Value;
}
export function assigned(log) {
  let Value = 'before';
  ({
    w: {
      Map: Value
    }
  } = {
    get w() {
      _pushMaybeArray(log).call(log, Value);
      return {
        Map: _Map
      };
    }
  });
  return Value;
}