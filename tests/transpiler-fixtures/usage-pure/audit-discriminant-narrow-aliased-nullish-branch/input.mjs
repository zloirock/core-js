// Union branch that's an alias to a nullish keyword: `type N = null;` makes `Inner | N`
// have N as a TypeReference at the flatten step. without resolving the ref through to
// its `null` body, the downstream nullish-branch filter doesn't recognise N and the
// discriminant narrow degrades. pushing the alias-resolved node (TSNullKeyword) lets the
// filter exclude N and narrow `Inner | N` cleanly when `x.kind === 'a'` holds.
// braced if-body so the emitted `var _ref;` lands in the same slot across babel and
// unplugin runners (bodyless slot would force babel to hoist while unplugin block-wraps)
type N = null;
type Inner = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
type Outer = Inner | N;
declare const x: Outer;
if (x.kind === 'a') {
  x.data.at(0);
}
