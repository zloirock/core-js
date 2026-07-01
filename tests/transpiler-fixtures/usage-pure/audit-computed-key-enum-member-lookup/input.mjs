// computed-string-key on TSEnumDeclaration member: `Kind['A']` should resolve to
// the enum member's literal value the same as `Kind.A`. exercises the computed-key name
// resolution's member-property fallback after the computed-literal normalization
enum Kind { A = 'a', B = 'b' }
type Box = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };
function pickFirst(box: Box) {
  if (box.kind === Kind['A']) {
    return box.data.at(0);
  }
  return box.data;
}
export { pickFirst };
