// discriminant comparison with const-alias RHS: `const A = 'a'; box.kind === A`.
// the alias must resolve to its literal initialiser so the discriminated union narrows
// the same as a direct `box.kind === 'a'` comparison
type Box = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };
function pickFirst(box: Box) {
  const A = 'a';
  if (box.kind === A) {
    return box.data.at(0);
  }
  return box.data;
}
export { pickFirst };
