// Heterogeneous literal elements need a guard around the nested static extraction.
// A custom property is retained and a null receiver still throws on its own iteration.
for (let { w: { from } } of [{ w: Array }, { w: { from: custom } }, { w: null }]) {
  use(from([7]), () => from([8]));
}
