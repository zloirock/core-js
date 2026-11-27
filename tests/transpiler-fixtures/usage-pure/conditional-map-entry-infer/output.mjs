import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Map iterates pairs, so its inferred element cannot satisfy a string constraint.
type Result<T> = T extends Iterable<infer U extends string> ? string : number[];
export function read(value: Result<Map<string, number>>) {
  return _atMaybeArray(value).call(value, 0);
}
export const result = read([7]);