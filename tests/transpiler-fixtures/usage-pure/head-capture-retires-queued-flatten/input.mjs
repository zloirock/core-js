// a static beside a nested instance leaf over a loop-head binding: the leaf's flatten takes the
// nested level, so the static extracts flat beside it on both legs - the pair renders once, never a
// second copy beside a capture (a duplicate declaration and a dangling ref)
const out = [];
for (const R of [Array]) {
  const { prototype: { at, length }, from } = R;
  out.push(at, length, from);
}
export { out };
