// `(s.kind) === 'a'` - paren-wrapped discriminant ref must narrow the union
// identically to the unwrapped form, so `s.data` is typed as `number[]` inside
// the branch and `.at(0)` uses the array-specific polyfill
type Shape = { kind: 'a'; data: number[] } | { kind: 'b'; data: string };
declare const s: Shape;
if ((s.kind) === 'a') {
  s.data.at(0);
}
