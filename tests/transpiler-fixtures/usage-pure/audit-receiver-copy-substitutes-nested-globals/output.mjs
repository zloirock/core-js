import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// receiver-copy vs re-read-observability boundary. a literal nesting a member READ (`Map.prototype`)
// must NOT be emitted twice - the read would re-fire on the copy - but a SOLE binding reads it once,
// so the eliminate-residual extraction still emits it (single read, like native). identifier-only
// literals stay freely copyable. every nested global substitutes the same as babel's re-traversed
// clone (a raw global would ReferenceError on an engine lacking it). each declaration uses a
// distinct instance method so the emitted copy is attributable to its receiver shape.
const flag = true;
const a = _atMaybeArray([_Map.prototype]);
const b = _includesMaybeArray([flag ? _Set : _WeakMap]);
const c = _flatMaybeArray([{
  [_Promise]: 1
}]);
export const r = [a, b, c];