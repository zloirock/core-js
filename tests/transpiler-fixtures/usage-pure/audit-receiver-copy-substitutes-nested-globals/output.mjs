import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a re-referenceable receiver copied into the instance polyfill's argument must substitute EVERY
// nested global the same as babel's re-traversed clone - across a member chain with a bare-constructor
// root, a computed object key, and a conditional's branches. a raw global would ReferenceError on an
// engine lacking it (and at an eliminate-residual site the in-place import is never emitted). each
// declaration uses a distinct instance method so the emitted copy is attributable to its receiver shape.
const flag = true;
const a = _atMaybeArray([_Map.prototype]);
const b = _includesMaybeArray([flag ? _Set : _WeakMap]);
const c = _flatMaybeArray([{
  [_Promise]: 1
}]);
export const r = [a, b, c];