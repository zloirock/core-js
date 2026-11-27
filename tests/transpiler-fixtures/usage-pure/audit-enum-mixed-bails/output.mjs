import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// A mixed string and number enum needs generic dispatch when its own method is read.
enum Mixed {
  A = 'a',
  B = 1
}
declare const x: Mixed;
const arr: string[] = ['a', 'b'];
(_atMaybeArray(arr) || 0).call(arr, x as any);
// @ts-expect-error probe a method absent from at least one enum member
typeof _at(x);