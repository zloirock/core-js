// A loop binding supplies the receiver at this read.
for (const realm of [globalThis]) {
  const { Array: { prototype: { at } } } = realm;
  use(at);
}
