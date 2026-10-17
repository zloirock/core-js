import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Object$assign from "@core-js/pure/actual/object/assign";
// A write through an enum alias invalidates the declared computed key.
enum Aliased {
  MAP = 'map',
}
const aliasOfEnum = Aliased;
_Object$assign(aliasOfEnum, {
  MAP: 'filter'
});
export const r10 = _flatMaybeArray(arr)?.call(arr)[Aliased.MAP](f);