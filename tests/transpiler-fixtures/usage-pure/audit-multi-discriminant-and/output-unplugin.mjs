import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// multi-discriminant `kind === 'a' && sub === 'A1'` must narrow to the exact
// matching union arm (`{kind: 'a', sub: 'A1', data: string[]}`) so dispatch picks
// the right element-type polyfill
type Box =
  | { kind: 'a'; sub: 'A1'; data: string[] }
  | { kind: 'a'; sub: 'A2'; data: number[] }
  | { kind: 'b'; data: number };

function readFirst(box: Box) {
  if (box.kind === 'a' && box.sub === 'A1') {
    var _ref;
    return _atMaybeArray(_ref = box.data).call(_ref, 0);
  }
  return null;
}