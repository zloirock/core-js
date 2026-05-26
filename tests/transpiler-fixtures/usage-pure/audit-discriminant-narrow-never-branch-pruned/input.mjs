// `never` branch in a discriminant union: property-access guard (`x.kind === 'a'`) is
// unreachable on bottom-typed values, so the branch is pruned during narrow. without
// `TSNeverKeyword` in the nullish-branch set the filter would let `never` survive, the
// post-narrow type would carry an extra branch with no `data` member, and downstream
// narrowing through `x.data` would degrade to the union's least-common surface.
// braced if-body so the emitted `var _ref;` lands in the same slot across babel and
// unplugin runners
type Inner = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
type Outer = Inner | never;
declare const x: Outer;
if (x.kind === 'a') {
  x.data.at(0);
}
