import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
var _ref;
// A consumed nested assignment yields its original receiver after all bindings.
// Sibling getters observe the guarded write at the source property's position.
// A constructor escaping through the getter includes its static methods.
let Value = 'before',
  first,
  last;
const log = [];
const source = {
  get first() {
    _pushMaybeArray(log).call(log, Value);
    return 1;
  },
  get realm() {
    _pushMaybeArray(log).call(log, Value);
    return _globalThis;
  },
  get last() {
    _pushMaybeArray(log).call(log, typeof Value);
    return 2;
  }
};
const returned = (source, {
  first
} = source, {
  realm: _ref
} = source, Value = _ref === _globalThis ? _WeakSet : _ref.WeakSet, {
  last
} = source, source);
export { Value, first, last, returned, source, log };