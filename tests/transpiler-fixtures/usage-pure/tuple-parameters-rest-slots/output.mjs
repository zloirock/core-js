import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare function append(head: boolean, ...tail: [string, number[]]): void;
export function read(a: Parameters<typeof append>[1], b: Parameters<typeof append>[2]) {
  return [_atMaybeString(a).call(a, 0), _includesMaybeArray(b).call(b, 7)];
}