// An opaque or replaced loop value keeps its own receiver.
for (const realm of [globalThis, other]) {
  const { Array: { prototype: { at } } } = realm;
  use(at);
}
