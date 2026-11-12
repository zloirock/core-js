// The loop binding keeps its identity after redundant realm hops are removed.
for (const realm of [globalThis]) {
  const { globalThis: { Array: { prototype: { at } } } } = realm;
  const { self: { Array: { prototype: { includes } } } = globalThis } = realm;
  use(at, includes);
}
