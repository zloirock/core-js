import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// discriminant comparison RHS is an enum member accessed by single-quasi template-literal
// key: `box.kind === Kind[`A`]`. the enum-member literal value should resolve the same
// as `Kind.A` so the discriminated union narrows to the array branch
enum Kind { A = 'a', B = 'b' }
type Box = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };
function pickFirst(box: Box) {
  if (box.kind === Kind[`A`]) {
    var _ref;
    return _atMaybeArray(_ref = box.data).call(_ref, 0);
  }
  return box.data;
}
export { pickFirst };