import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// mapped type with `as` key remap blocks `unwrapMappedTypePassthrough`, but
// `expandMappedTypeMembers` enumerates the source's keys and evaluates the rename template
// per key. r._a -> source 'a' field's type (number[]) -> .at(0) narrows to the array polyfill
type RenameKeys<T> = { [K in keyof T as `_${string & K}`]: T[K] };
type Renamed = RenameKeys<{
  a: number[];
}>;
declare const r: Renamed;
_atMaybeArray(_ref = r._a).call(_ref, 0);