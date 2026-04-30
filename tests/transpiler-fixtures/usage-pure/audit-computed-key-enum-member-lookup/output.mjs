import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed-string-key on TSEnumDeclaration member: `Kind['A']` should resolve to
// the enum member's literal value the same as `Kind.A`. exercises resolveComputedKeyName's
// getMemberProperty fallback after the computed-literal normalization
enum Kind {
  A = 'a',
  B = 'b',
}
type Box = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
function pickFirst(box: Box) {
  if (box.kind === Kind['A']) {
    var _ref;
    return _atMaybeArray(_ref = box.data).call(_ref, 0);
  }
  return box.data;
}
export { pickFirst };