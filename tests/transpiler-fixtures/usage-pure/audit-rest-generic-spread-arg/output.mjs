import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// rest via spread-call `fn(...arr)` — args[0] is SpreadElement whose type IS the array;
// unwrap once to the element type so T binds to string (not string[])
function fn<T>(...xs: T[]): T {
  return xs[0];
}
const arr: string[] = ['a', 'b'];
const s = fn(...arr);
_atMaybeString(s).call(s, 0);