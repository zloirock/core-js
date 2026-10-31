import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// an alias of an array reads the elements its source holds, so a write through the source - a mutator,
// an element write, a hand-out - reaches a read through the alias too, through a decided selection or
// not; an alias of a source nothing writes keeps the element narrow
export function shifted() {
  var _ref;
  const source = ['abc'];
  const list = source;
  source.unshift([1]);
  return _flatMaybeArray(_ref = list[0]).call(_ref);
}
export function written() {
  var _ref2;
  const source = ['abc'];
  const list = source;
  source[0] = [1];
  return _findLastIndexMaybeArray(_ref2 = list[0]).call(_ref2, Boolean);
}
export function handedOut(fill) {
  var _ref3;
  const source = ['abc'];
  const list = source;
  fill(source);
  return _findLastMaybeArray(_ref3 = list[0]).call(_ref3, Boolean);
}
export function untouched() {
  var _ref4;
  const source = ['abc'];
  const list = source;
  return _atMaybeString(_ref4 = list[0]).call(_ref4, 0);
}