import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A discriminant check composed with a presence test this build always answers narrows by the part of the test that runs: a test
// always false leaves `||` to its right, a test always true leaves `&&` to it, a decided conditional its live arm, an exit's too -
// and a write to the discriminant after it drops the narrow as it would after the bare check.
type Box = {
  kind: 'text';
  data: string;
} | {
  kind: 'list';
  data: number[];
};
declare const flag: boolean;
export function either(box: Box) {
  var _ref;
  if (box.kind === 'text') return _atMaybeString(_ref = box.data).call(_ref, 0);
}
export function exit(box: Box) {
  var _ref2;
  if (box.kind !== 'text') return;
  return _includesMaybeString(_ref2 = box.data).call(_ref2, 'b');
}
export function exitConditional(box: Box) {
  var _ref3;
  if (box.kind !== 'text') return;
  return _atMaybeString(_ref3 = box.data).call(_ref3, -1);
}
export function rewritten(box: Box, other: Box) {
  if (box.kind === 'text') {
    var _ref4;
    box.kind = other.kind;
    return _sliceMaybeArray(_ref4 = box.data).call(_ref4, 1);
  }
}
export function alwaysTrue(box: Box) {
  var _ref5;
  if (true) return _concatMaybeArray(_ref5 = box.data).call(_ref5, 'd');
}
export function undecided(box: Box) {
  var _ref6;
  if (flag || box.kind === 'text') return _flatMaybeArray(_ref6 = box.data).call(_ref6);
}