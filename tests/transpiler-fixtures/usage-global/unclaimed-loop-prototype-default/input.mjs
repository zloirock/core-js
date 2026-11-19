// A claim in a nested default does not activate an otherwise untouched outer hop.
for (const realm of [globalThis]) {
  const { Array: { prototype: { at } = fallback() } } = realm;
  use(at);
}
