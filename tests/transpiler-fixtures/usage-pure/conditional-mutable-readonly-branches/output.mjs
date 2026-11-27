import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Either nested array can reach this check, including the readonly one.
type Batches = Array<string[]> | Array<readonly string[]>;
type Content = Batches extends Array<string[]> ? string : number[];
function read(value: Content) {
  return _atMaybeArray(value).call(value, 0);
}
export const result = read([42]);