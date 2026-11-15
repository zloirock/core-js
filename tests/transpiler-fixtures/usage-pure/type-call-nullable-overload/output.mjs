import _at from "@core-js/pure/actual/instance/at";
// A possibly undefined argument does not prove the non-nullable overload.
declare function read(value: string): number[];
declare function read(value: string | undefined): string;
export function last(value: string | undefined) {
  var _ref;
  return _at(_ref = read(value)).call(_ref, -1);
}