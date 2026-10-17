import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Object.assign changes the enum key before the optional member read.
enum Assigned {
  MAP = 'map'
}
_Object$assign(Assigned, {
  MAP: 'filter'
});
export const r9 = _flatMaybeArray(arr)?.call(arr)[Assigned.MAP](f);