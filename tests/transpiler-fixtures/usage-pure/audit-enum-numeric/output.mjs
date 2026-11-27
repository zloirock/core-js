import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A numeric enum is an argument to the array call. Reading its own at leaves the Number receiver alone.
enum Color {
  Red,
  Green,
  Blue
}
declare const c: Color;
const arr: string[] = ['a', 'b', 'c'];
(_atMaybeArray(arr) || 0).call(arr, c);
// @ts-expect-error probe a method absent from at least one enum member
typeof c.at;