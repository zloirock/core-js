// a static beside a nested instance leaf over a loop-head binding: the static's retained capture
// replaces the declarator the leaf's flatten was queued on, so the flatten renders once, off the
// capture - never a second copy of the pair beside it (a duplicate declaration and a dangling ref)
const out = [];
for (const R of [Array]) {
  const { prototype: { at, length }, from } = R;
  out.push(at, length, from);
}
export { out };
