import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _WeakSet from "@core-js/pure/actual/weak-set";
// A getter's returned realm is a candidate; keep its read and guard the actual value.
export function direct() {
  var _ref;
  const source = {
    get w() {
      log();
      return _globalThis;
    }
  };
  return _ref = source.w, _ref === _globalThis ? _WeakSet : _ref.WeakSet;
}

// A preserved call returning its first argument may change that argument's slots.
function replace(source, key, value) {
  return source[key] = value, source;
}
export function throughCall(key, value) {
  var _ref2;
  const source = replace({
    get w() {
      log();
      return _globalThis;
    }
  }, key, value);
  return _ref2 = source.w, _ref2 === _globalThis ? _WeakSet : _ref2.WeakSet;
}
export function shadowed(globalThis) {
  const source = {
    get w() {
      log();
      return globalThis;
    }
  };
  return source.w.WeakSet;
}

// A realm candidate must not suppress an ordinary instance dispatcher.
export function instance() {
  const source = {
    get w() {
      log();
      return _globalThis;
    }
  };
  return _at(source.w);
}