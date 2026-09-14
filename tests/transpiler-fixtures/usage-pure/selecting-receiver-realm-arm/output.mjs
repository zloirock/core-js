import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A chain rooted at a SELECTION names its candidates by the arms: an arm that resolves to a
// pristine proxy global - spelled, or reached through a call the census resolves - is a realm the
// captured receiver is tested against; an opaque arm falls through to the raw read the guard keeps.
function realm() {
  return _globalThis;
}
function opaque() {
  return {
    Array: {
      of() {
        return 'custom';
      }
    }
  };
}
export function direct(flag) {
  var _ref;
  return _ref = (flag ? realm() : opaque()).Array, _ref === Array ? _Array$of(1) : _ref.of(1);
}
export function aliased(flag) {
  var _ref2;
  const held = (flag ? realm() : opaque()).Array;
  return _ref2 = held, _ref2 === Array ? _Array$of(1) : _ref2.of(1);
}
export function spelled(flag) {
  var _ref3;
  return _ref3 = (flag ? _globalThis : opaque()).Array, _ref3 === Array ? _Array$of(1) : _ref3.of(1);
}
// A constructor with a pure entry keeps its statics: the read off the selection is a held slot.
export function ctorStatic(flag) {
  var _ref4;
  return (_ref4 = flag ? realm() : opaque(), _ref4 === _globalThis ? _Map : _ref4.Map).groupBy([1, 2], value => value % 2);
}
// No arm names a realm: nothing to test against, the read stays native.
export function opaqueOnly(flag) {
  return (flag ? opaque() : {
    Array
  }).Array.of(1);
}