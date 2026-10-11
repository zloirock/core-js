import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A guard composed with a presence test this build always answers narrows by the part of the
// test that runs: a test always false leaves `||` to its right, one always true leaves `&&` to its
// right. A test always true over `||` and an undecided one narrow nothing.
export function either(x) {
  if (typeof x == 'string') return _atMaybeString(x).call(x, 0);
}
export function exit(x) {
  if (typeof x != 'string') return;
  return _includesMaybeString(x).call(x, 'b');
}
export function alwaysTrue(x) {
  if (true) return _sliceMaybeArray(x).call(x, 1);
}
export function undecided(x) {
  if (_globalThis.flag || typeof x == 'string') return _concatMaybeArray(x).call(x, 'd');
}