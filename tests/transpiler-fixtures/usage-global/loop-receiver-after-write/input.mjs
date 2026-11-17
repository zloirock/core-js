// An opaque or replaced loop value keeps its own receiver.
for (let realm of [globalThis]) {
  realm = other;
  const { Array: { prototype: { includes } } } = realm;
  use(includes);
}
