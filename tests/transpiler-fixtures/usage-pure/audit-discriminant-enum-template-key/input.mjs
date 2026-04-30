// discriminant comparison RHS is an enum member accessed by single-quasi template-literal
// key: `box.kind === Kind[`A`]`. the enum-member literal value should resolve the same
// as `Kind.A` so the discriminated union narrows to the array branch
enum Kind { A = 'a', B = 'b' }
type Box = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };
function pickFirst(box: Box) {
  if (box.kind === Kind[`A`]) {
    return box.data.at(0);
  }
  return box.data;
}
export { pickFirst };
