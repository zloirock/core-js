import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A non-null assertion restores the primitive overload after the nullable guard.
declare function read(value: string): number[];
declare function read(value: string | undefined): string;
export function last(value: string | undefined) {
  var _ref;
  return _atMaybeArray(_ref = read(value!)).call(_ref, -1);
}