// A constructor element retains its prototype family in patterns and member reads.
// Repeated identical constructors agree; shadowed and mixed elements stay conservative.
for (const R of [Array, Array]) {
  const { prototype: { at } } = R;
  R.prototype.includes;
}
